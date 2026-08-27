import type { PackageManifest, PublicEntry } from "./types";

const CONDITIONS = ["browser", "import", "module", "default", "require", "node"];

function selectTarget(value: unknown): { target: string; condition: string } | undefined {
  if (typeof value === "string") return { target: value, condition: "default" };
  if (Array.isArray(value)) {
    for (const candidate of value) {
      const selected = selectTarget(candidate);
      if (selected) return selected;
    }
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    for (const condition of CONDITIONS) {
      if (condition in record) {
        const selected = selectTarget(record[condition]);
        if (selected) return { ...selected, condition };
      }
    }
    // `types` is metadata, not a runtime export. A common shape is
    // { import: { types: "./x.d.ts", default: "./x.js" } }; never let the
    // declaration file win just because it happens to be the first key.
    for (const [key, candidate] of Object.entries(record)) {
      if (key === "types") continue;
      const selected = selectTarget(candidate);
      if (selected) return selected;
    }
  }
  return undefined;
}

function labelFor(manifest: PackageManifest, subpath: string): string {
  return subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`;
}

function entriesForPattern(manifest: PackageManifest, subpath: string, target: string, condition: string, files?: Iterable<string>): PublicEntry[] {
  if (!files || !subpath.includes("*") || !target.includes("*")) return [];
  const marker = target.indexOf("*");
  const before = target.slice(0, marker).replace(/^\.\//, "");
  const after = target.slice(marker + 1);
  const result: PublicEntry[] = [];
  for (const file of files) {
    if (!file.startsWith(before) || !file.endsWith(after)) continue;
    const matched = file.slice(before.length, file.length - after.length);
    if (!matched || matched.includes("..")) continue;
    const resolvedSubpath = subpath.replace("*", matched);
    result.push({ subpath: resolvedSubpath, label: labelFor(manifest, resolvedSubpath), target: `./${file}`, condition });
  }
  return result;
}

/**
 * List every concrete public package entry. Explicit exports are always
 * listed; pattern exports are expanded from the published archive when it is
 * available, so the UI never presents an unmeasurable `*` as an entry.
 */
export function listPublicEntries(manifest: PackageManifest, files?: Iterable<string>): PublicEntry[] {
  const exportsMap = manifest.exports;
  const entries: PublicEntry[] = [];
  if (typeof exportsMap === "string" || Array.isArray(exportsMap)) {
    const selected = selectTarget(exportsMap);
    if (selected) entries.push({ subpath: ".", label: manifest.name, ...selected });
  } else if (exportsMap && typeof exportsMap === "object") {
    const record = exportsMap as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.some((key) => key.startsWith("."))) {
      keys.filter((key) => key.startsWith(".")).forEach((subpath) => {
        const selected = selectTarget(record[subpath]);
        if (!selected) return;
        if (subpath.includes("*")) entries.push(...entriesForPattern(manifest, subpath, selected.target, selected.condition, files));
        else entries.push({ subpath, label: labelFor(manifest, subpath), ...selected });
      });
    } else {
      const selected = selectTarget(record);
      if (selected) entries.push({ subpath: ".", label: manifest.name, ...selected });
    }
  }
  if (!entries.length) {
    const target = manifest.module || (typeof manifest.browser === "string" ? manifest.browser : undefined) || manifest.main || "index.js";
    entries.push({ subpath: ".", label: manifest.name, target, condition: manifest.module ? "module" : "legacy" });
  }
  return [...new Map(entries.map((entry) => [entry.subpath, entry])).values()].sort((a, b) => {
    if (a.subpath === ".") return -1;
    if (b.subpath === ".") return 1;
    return a.subpath.localeCompare(b.subpath);
  });
}

export function resolveExport(manifest: PackageManifest, subpath: string): string {
  const entries = listPublicEntries(manifest);
  const match = entries.find((entry) => entry.subpath === subpath);
  if (match) return match.target;
  if (manifest.exports && typeof manifest.exports === "object" && !Array.isArray(manifest.exports)) {
    const record = manifest.exports as Record<string, unknown>;
    for (const [pattern, value] of Object.entries(record)) {
      if (!pattern.includes("*")) continue;
      const selected = selectTarget(value);
      const expression = new RegExp(`^${pattern.split("*").map(escapeRegExp).join("(.*)")}$`);
      const captured = expression.exec(subpath)?.[1];
      if (selected && captured !== undefined) return selected.target.replace("*", captured);
    }
  }
  return subpath === "." ? (manifest.module || manifest.main || "index.js") : subpath.replace(/^\.\//, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
