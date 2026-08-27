import { gunzipSync, strFromU8 } from "fflate";
import type { ArchivePackage, PackageManifest } from "./types";

export const DOWNLOAD_CAP = 50 * 1024 * 1024;

function readString(bytes: Uint8Array, start: number, length: number): string {
  return new TextDecoder().decode(bytes.subarray(start, start + length)).replace(/\0.*$/, "");
}

export function untar(tar: Uint8Array): Map<string, Uint8Array> {
  const files = new Map<string, Uint8Array>();
  let offset = 0;
  while (offset + 512 <= tar.length) {
    const name = readString(tar, offset, 100);
    if (!name) break;
    const prefix = readString(tar, offset + 345, 155);
    const sizeText = readString(tar, offset + 124, 12).trim();
    const size = Number.parseInt(sizeText || "0", 8);
    const type = tar[offset + 156];
    const fullName = prefix ? `${prefix}/${name}` : name;
    const normalized = fullName.replace(/^package\//, "").replace(/^\.\//, "");
    const bodyStart = offset + 512;
    if ((type === 0 || type === 48) && normalized && !normalized.includes("../")) {
      files.set(normalized, tar.slice(bodyStart, bodyStart + size));
    }
    offset = bodyStart + Math.ceil(size / 512) * 512;
  }
  return files;
}

export async function downloadPackage(manifest: PackageManifest, signal?: AbortSignal): Promise<ArchivePackage> {
  const tarball = manifest.dist?.tarball;
  if (!tarball) throw new Error(`${manifest.name}@${manifest.version} does not publish a tarball URL.`);
  const response = await fetch(tarball, { signal });
  if (!response.ok) throw new Error(`The tarball download returned ${response.status}.`);
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared > DOWNLOAD_CAP) throw new Error("This compressed package is over the 50 MB browser-analysis limit.");
  const compressed = new Uint8Array(await response.arrayBuffer());
  if (compressed.length > DOWNLOAD_CAP) throw new Error("This compressed package is over the 50 MB browser-analysis limit.");
  const files = untar(gunzipSync(compressed));
  const packageJson = files.get("package.json");
  if (!packageJson) throw new Error("The package tarball does not contain package.json.");
  const archiveManifest = JSON.parse(strFromU8(packageJson)) as PackageManifest;
  return {
    key: `${archiveManifest.name}@${archiveManifest.version}`,
    manifest: { ...manifest, ...archiveManifest, dist: manifest.dist },
    files,
    compressedBytes: compressed.length,
  };
}
