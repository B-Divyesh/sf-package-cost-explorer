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
    for (const candidate of Object.values(record)) {
      const selected = selectTarget(candidate);
      if (selected) return selected;
    }
  }
  return undefined;
}

export function listPublicEntries(manifest: PackageManifest): PublicEntry[] {
  const exportsMap = manifest.exports;
  const entries: PublicEntry[] = [];
  if (typeof exportsMap === "string" || Array.isArray(exportsMap)) {
    const selected = selectTarget(exportsMap);
    if (selected) entries.push({ subpath: ".", label: manifest.name, ...selected });
  } else if (exportsMap && typeof exportsMap === "object") {
    const record = exportsMap as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.some((key) => key.startsWith("."))) {
      keys.filter((key) => key.startsWith(".") && !key.includes("*")).forEach((subpath) => {
        const selected = selectTarget(record[subpath]);
        if (selected) entries.push({ subpath, label: subpath === "." ? manifest.name : `${manifest.name}${subpath.slice(1)}`, ...selected });
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
  return entries;
}

export function resolveExport(manifest: PackageManifest, subpath: string): string {
  const entries = listPublicEntries(manifest);
  const match = entries.find((entry) => entry.subpath === subpath);
  if (match) return match.target;
  return subpath === "." ? (manifest.module || manifest.main || "index.js") : subpath.replace(/^\.\//, "");
}
