import { maxSatisfying, valid } from "semver";
import type { DependencyReport, PackageManifest, Packument, VersionPoint } from "./types";

const REGISTRY = "https://registry.npmjs.org";

interface SearchResult {
  objects?: Array<{ package?: { name?: string } }>;
}

/**
 * Avoid issuing a known-404 packument fetch for a typo in the user-facing
 * search box. Chromium treats that expected response as a console error,
 * which obscures genuine application failures. Dependency traversal still
 * uses packuments directly because missing children are intentionally best
 * effort and must not block a useful report.
 */
export async function confirmPublicPackage(name: string, signal?: AbortSignal): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${REGISTRY}/-/v1/search?text=${encodeURIComponent(name)}&size=250`, {
      headers: { Accept: "application/json" },
      signal,
    });
  } catch (error) {
    if (!navigator.onLine) throw new Error("You appear to be offline. Reconnect, then run the analysis again.");
    if ((error as Error).name === "AbortError") throw error;
    throw new Error("The npm registry could not be reached. Check your connection and try again.");
  }
  if (!response.ok) throw new Error(`The npm registry returned ${response.status}. Wait a moment, then try again.`);
  const result = await response.json() as SearchResult;
  if (!result.objects?.some((item) => item.package?.name?.toLowerCase() === name.toLowerCase())) {
    throw new Error(`npm has no published package named “${name}”. Check the spelling.`);
  }
}

export async function fetchPackument(name: string, signal?: AbortSignal): Promise<Packument> {
  let response: Response;
  try {
    response = await fetch(`${REGISTRY}/${encodeURIComponent(name)}`, {
      headers: { Accept: "application/vnd.npm.install-v1+json" },
      signal,
    });
  } catch (error) {
    if (!navigator.onLine) throw new Error("You appear to be offline. Reconnect, then run the analysis again.");
    if ((error as Error).name === "AbortError") throw error;
    throw new Error("The npm registry could not be reached. Check your connection and try again.");
  }
  if (response.status === 404) throw new Error(`npm has no published package named “${name}”. Check the spelling.`);
  if (!response.ok) throw new Error(`The npm registry returned ${response.status}. Wait a moment, then try again.`);
  return response.json() as Promise<Packument>;
}

export function resolveDependencyVersion(packument: Packument, range: string): string | undefined {
  if (packument["dist-tags"]?.[range]) return packument["dist-tags"][range];
  if (valid(range) && packument.versions[range]) return range;
  try {
    return maxSatisfying(Object.keys(packument.versions), range, { includePrerelease: false }) || undefined;
  } catch {
    return packument["dist-tags"]?.latest;
  }
}

export function versionHistory(packument: Packument, limit = 14): VersionPoint[] {
  const points = Object.entries(packument.versions)
    .map(([version, manifest]) => ({
      version,
      date: packument.time?.[version] || "",
      unpackedSize: manifest.dist?.unpackedSize || 0,
    }))
    .filter((point) => point.unpackedSize > 0);
  if (packument.time) points.sort((a, b) => a.date.localeCompare(b.date));
  return points.slice(-limit);
}

export async function countDependencies(
  root: PackageManifest,
  signal: AbortSignal | undefined,
  onProgress: (count: number) => void,
  cap = 400,
): Promise<DependencyReport> {
  // Optional packages are commonly installed and can materially change the
  // footprint. Prefer a regular dependency range if both declarations exist.
  const direct: Array<{ name: string; range: string; version?: string }> = Object.entries({
    ...(root.optionalDependencies || {}),
    ...(root.dependencies || {}),
  }).map(([name, range]) => ({ name, range }));
  const queue = direct.map((item) => ({ ...item }));
  const seen = new Set<string>();
  const packuments = new Map<string, Promise<Packument>>();
  let traversed = 0;
  let unpackedBytes = root.dist?.unpackedSize || 0;

  const load = (name: string) => {
    const cached = packuments.get(name);
    if (cached) return cached;
    const request = fetchPackument(name, signal);
    packuments.set(name, request);
    return request;
  };

  while (queue.length && seen.size < cap) {
    const batch = queue.splice(0, 8);
    await Promise.all(batch.map(async (item) => {
      if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
      try {
        const packument = await load(item.name);
        const version = resolveDependencyVersion(packument, item.range);
        if (!version) return;
        const key = `${item.name}@${version}`;
        if (seen.has(key)) return;
        seen.add(key);
        traversed += 1;
        unpackedBytes += manifestSize(packument.versions[version]);
        const directItem = direct.find((candidate) => candidate.name === item.name && candidate.range === item.range);
        if (directItem) directItem.version = version;
        const manifest = packument.versions[version];
        Object.entries({ ...(manifest?.optionalDependencies || {}), ...(manifest?.dependencies || {}) }).forEach(([name, range]) => queue.push({ name, range }));
      } catch {
        // A deprecated or private child must not prevent the useful aggregate.
      }
    }));
    onProgress(seen.size);
  }
  return { unique: seen.size, traversed, unpackedBytes, capped: queue.length > 0, direct };
}

function manifestSize(manifest: PackageManifest | undefined): number {
  return manifest?.dist?.unpackedSize || 0;
}
