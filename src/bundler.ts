import { gzipSync } from "fflate";
import wasmUrl from "esbuild-wasm/esbuild.wasm?url";
import type { Loader, Plugin } from "esbuild-wasm";
import { DOWNLOAD_CAP, downloadPackage } from "./archive";
import { resolveExport } from "./exports-map";
import { fetchPackument, resolveDependencyVersion } from "./registry";
import type { ArchivePackage, BundleMeasurement, NamedMeasurement, PackageManifest, PublicEntry } from "./types";

const NODE_BUILTINS = new Set([
  "assert", "async_hooks", "buffer", "child_process", "cluster", "console", "constants", "crypto", "dgram", "diagnostics_channel", "dns", "domain", "events", "fs", "http", "http2", "https", "module", "net", "os", "path", "perf_hooks", "process", "punycode", "querystring", "readline", "repl", "stream", "string_decoder", "sys", "timers", "tls", "tty", "url", "util", "v8", "vm", "wasi", "worker_threads", "zlib",
]);

let esbuildReady: Promise<typeof import("esbuild-wasm")> | undefined;

async function getEsbuild() {
  if (!esbuildReady) {
    esbuildReady = import("esbuild-wasm").then(async (esbuild) => {
      await esbuild.initialize({ wasmURL: wasmUrl, worker: true });
      return esbuild;
    });
  }
  return esbuildReady;
}

function packageRequest(specifier: string): { name: string; subpath: string } {
  const parts = specifier.split("/");
  const name = specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0] || specifier;
  return { name, subpath: specifier.slice(name.length) ? `.${specifier.slice(name.length)}` : "." };
}

function normalize(path: string): string {
  const stack: string[] = [];
  path.replace(/^\.\//, "").split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") stack.pop();
    else stack.push(part);
  });
  return stack.join("/");
}

function joinPath(base: string, relative: string): string {
  return normalize(`${base.slice(0, Math.max(0, base.lastIndexOf("/") + 1))}${relative}`);
}

function splitVirtual(path: string): [string, string] {
  const index = path.indexOf("::");
  return [path.slice(0, index), path.slice(index + 2)];
}

function loaderFor(path: string): Loader {
  if (path.endsWith(".tsx")) return "tsx";
  if (path.endsWith(".ts") || path.endsWith(".mts") || path.endsWith(".cts")) return "ts";
  if (path.endsWith(".jsx")) return "jsx";
  if (path.endsWith(".json")) return "json";
  return "js";
}

function findFile(pkg: ArchivePackage, requested: string): string | undefined {
  const clean = normalize(requested);
  const candidates = [
    clean,
    `${clean}.js`, `${clean}.mjs`, `${clean}.cjs`, `${clean}.ts`, `${clean}.tsx`, `${clean}.jsx`, `${clean}.json`,
    `${clean}/index.js`, `${clean}/index.mjs`, `${clean}/index.cjs`, `${clean}/index.ts`,
  ];
  for (const candidate of candidates) if (pkg.files.has(candidate)) return candidate;
  const nestedManifest = pkg.files.get(`${clean}/package.json`);
  if (nestedManifest) {
    try {
      const nested = JSON.parse(new TextDecoder().decode(nestedManifest)) as PackageManifest;
      return findFile(pkg, `${clean}/${nested.module || nested.main || "index.js"}`);
    } catch { /* fall through */ }
  }
  return undefined;
}

class ArchiveStore {
  readonly packages = new Map<string, ArchivePackage>();
  readonly requests = new Map<string, Promise<ArchivePackage>>();
  totalCompressed = 0;

  constructor(root: ArchivePackage, private readonly signal?: AbortSignal) {
    this.packages.set(root.key, root);
    this.totalCompressed = root.compressedBytes;
  }

  async install(name: string, range: string): Promise<ArchivePackage> {
    const requestKey = `${name}|${range}`;
    const pending = this.requests.get(requestKey);
    if (pending) return pending;
    const request = (async () => {
      const packument = await fetchPackument(name, this.signal);
      const version = resolveDependencyVersion(packument, range);
      if (!version) throw new Error(`Could not resolve ${name}@${range}`);
      const key = `${name}@${version}`;
      const loaded = this.packages.get(key);
      if (loaded) return loaded;
      const manifest = packument.versions[version];
      if (!manifest) throw new Error(`npm metadata omitted ${key}`);
      const archive = await downloadPackage(manifest, this.signal);
      this.totalCompressed += archive.compressedBytes;
      if (this.totalCompressed > DOWNLOAD_CAP) throw new Error("Bundling dependencies exceeded the 50 MB download limit.");
      this.packages.set(key, archive);
      return archive;
    })();
    this.requests.set(requestKey, request);
    return request;
  }
}

async function brotliSize(bytes: Uint8Array): Promise<number | undefined> {
  try {
    const Compression = CompressionStream as unknown as new (format: string) => CompressionStream;
    const copy = new Uint8Array(bytes);
    const stream = new Blob([copy.buffer]).stream().pipeThrough(new Compression("brotli"));
    return (await new Response(stream).arrayBuffer()).byteLength;
  } catch {
    try {
      const module = await import("brotli-wasm");
      const brotli = await module.default;
      return brotli.compress(bytes, { quality: 11 }).length;
    } catch {
      return undefined;
    }
  }
}

interface BuildOutput {
  bytes: Uint8Array;
  exports: string[];
  warnings: string[];
  externals: string[];
}

async function bundleOnce(root: ArchivePackage, entry: PublicEntry, store: ArchiveStore, named?: string): Promise<BuildOutput> {
  const esbuild = await getEsbuild();
  const externals = new Set<string>();
  const notes = new Set<string>();
  const rootSpecifier = entry.subpath === "." ? root.manifest.name : `${root.manifest.name}${entry.subpath.slice(1)}`;
  const entrySource = named ? `export { ${named} } from ${JSON.stringify(rootSpecifier)};` : `export * from ${JSON.stringify(rootSpecifier)};`;

  const plugin: Plugin = {
    name: "npm-browser-ledger",
    setup(build) {
      build.onResolve({ filter: /^ledger:entry$/ }, () => ({ path: "ledger:entry", namespace: "ledger-entry" }));
      build.onLoad({ filter: /.*/, namespace: "ledger-entry" }, () => ({ contents: entrySource, loader: "js", resolveDir: "/" }));

      build.onResolve({ filter: /.*/, namespace: "ledger-entry" }, (args) => {
        const requested = packageRequest(args.path);
        if (requested.name !== root.manifest.name) return { errors: [{ text: `Unexpected root import ${args.path}` }] };
        const target = resolveExport(root.manifest, requested.subpath);
        const file = findFile(root, target);
        return file ? { path: `${root.key}::${file}`, namespace: "npm" } : { errors: [{ text: `Export ${requested.subpath} points to missing file ${target}` }] };
      });

      build.onResolve({ filter: /.*/, namespace: "npm" }, async (args) => {
        const [key, importer] = splitVirtual(args.importer);
        const parent = store.packages.get(key);
        if (!parent) return { errors: [{ text: `Missing package archive ${key}` }] };

        if (args.path.startsWith(".") || args.path.startsWith("/")) {
          const requested = args.path.startsWith("/") ? args.path.slice(1) : joinPath(importer, args.path);
          const file = findFile(parent, requested);
          if (file) return { path: `${key}::${file}`, namespace: "npm" };
          return { errors: [{ text: `Could not resolve ${args.path} in ${key}` }] };
        }

        const bare = args.path.replace(/^node:/, "");
        if (args.path.startsWith("node:") || NODE_BUILTINS.has(bare)) {
          externals.add(bare);
          return { path: args.path, external: true };
        }
        const requested = packageRequest(args.path);
        const peerRange = parent.manifest.peerDependencies?.[requested.name];
        if (peerRange) {
          externals.add(`${requested.name} (peer)`);
          return { path: args.path, external: true };
        }
        const range = parent.manifest.dependencies?.[requested.name] || parent.manifest.optionalDependencies?.[requested.name];
        if (!range) {
          externals.add(`${requested.name} (undeclared)`);
          return { path: args.path, external: true };
        }
        try {
          const dependency = await store.install(requested.name, range);
          const target = resolveExport(dependency.manifest, requested.subpath);
          const file = findFile(dependency, target);
          if (file) return { path: `${dependency.key}::${file}`, namespace: "npm" };
          externals.add(`${requested.name} (unresolved export)`);
          return { path: args.path, external: true };
        } catch (error) {
          notes.add((error as Error).message);
          return { path: args.path, external: true };
        }
      });

      build.onLoad({ filter: /.*/, namespace: "npm" }, (args) => {
        const [key, file] = splitVirtual(args.path);
        const pkg = store.packages.get(key);
        const bytes = pkg?.files.get(file);
        if (!bytes) return { errors: [{ text: `Missing ${file} in ${key}` }] };
        if (/\.(css|scss|sass|less|styl)$/.test(file)) {
          notes.add("Stylesheet imports are excluded from the JavaScript measurement.");
          return { contents: "", loader: "js" };
        }
        if (/\.(node|wasm|png|jpe?g|gif|svg|woff2?)$/.test(file)) {
          notes.add(`Asset import ${file} is excluded from the JavaScript measurement.`);
          return { contents: "export default '';", loader: "js" };
        }
        return { contents: bytes, loader: loaderFor(file), resolveDir: `/${key}/${file}` };
      });
    },
  };

  const result = await esbuild.build({
    entryPoints: ["ledger:entry"],
    bundle: true,
    minify: true,
    treeShaking: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    write: false,
    metafile: true,
    logLevel: "silent",
    plugins: [plugin],
  });
  const output = result.outputFiles?.find((file) => file.path.endsWith(".js")) || result.outputFiles?.[0];
  if (!output) throw new Error(`esbuild produced no JavaScript for ${entry.label}.`);
  const outputMeta = Object.values(result.metafile?.outputs || {})[0];
  return {
    bytes: output.contents,
    exports: outputMeta?.exports || [],
    warnings: [...notes, ...result.warnings.map((warning) => warning.text)],
    externals: [...externals],
  };
}

export async function bundleEntries(
  root: ArchivePackage,
  entries: PublicEntry[],
  signal: AbortSignal | undefined,
  onProgress: (done: number, total: number, label: string) => void,
): Promise<{ measurements: BundleMeasurement[]; named: NamedMeasurement[]; downloaded: number }> {
  const store = new ArchiveStore(root, signal);
  const measurements: BundleMeasurement[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const entry = entries[index]!;
    onProgress(index, entries.length, entry.label);
    const result = await bundleOnce(root, entry, store);
    measurements.push({
      entry,
      minified: result.bytes.length,
      gzip: gzipSync(result.bytes, { level: 9 }).length,
      brotli: await brotliSize(result.bytes),
      exports: result.exports,
      warnings: result.warnings,
      externals: result.externals,
    });
  }

  const named: NamedMeasurement[] = [];
  const primary = measurements[0];
  const names = (primary?.exports || []).filter((name) => name !== "default" && /^[A-Za-z_$][\w$]*$/.test(name)).slice(0, 10);
  for (const name of names) {
    const result = await bundleOnce(root, primary!.entry, store, name);
    named.push({ name, minified: result.bytes.length, gzip: gzipSync(result.bytes, { level: 9 }).length });
  }
  onProgress(entries.length, entries.length, "Complete");
  return { measurements, named, downloaded: store.totalCompressed };
}
