export interface DistInfo {
  tarball: string;
  unpackedSize?: number;
  fileCount?: number;
  integrity?: string;
}

export interface PackageManifest {
  name: string;
  version: string;
  description?: string;
  exports?: unknown;
  imports?: Record<string, unknown>;
  main?: string;
  module?: string;
  browser?: string | Record<string, string | false>;
  type?: "module" | "commonjs";
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  engines?: Record<string, string>;
  repository?: string | { url?: string };
  license?: string;
  dist?: DistInfo;
}

export interface Packument {
  name: string;
  description?: string;
  "dist-tags": Record<string, string>;
  versions: Record<string, PackageManifest>;
  time?: Record<string, string>;
}

export interface PackageSpec {
  name: string;
  requested: string;
}

export interface PublicEntry {
  subpath: string;
  label: string;
  target: string;
  condition: string;
}

export interface ArchivePackage {
  key: string;
  manifest: PackageManifest;
  files: Map<string, Uint8Array>;
  compressedBytes: number;
}

export interface BundleMeasurement {
  entry: PublicEntry;
  minified: number;
  gzip: number;
  brotli?: number;
  exports: string[];
  warnings: string[];
  externals: string[];
}

export interface NamedMeasurement {
  name: string;
  minified: number;
  gzip: number;
}

export interface DependencyReport {
  unique: number;
  traversed: number;
  capped: boolean;
  direct: Array<{ name: string; range: string; version?: string }>;
}

export interface VersionPoint {
  version: string;
  date: string;
  unpackedSize: number;
}
