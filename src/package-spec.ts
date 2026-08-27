import { maxSatisfying, valid } from "semver";
import type { PackageSpec, Packument, PackageManifest } from "./types";

const NAME = /^(?:@[a-z0-9][a-z0-9._~-]*\/[a-z0-9][a-z0-9._~-]*|[a-z0-9][a-z0-9._~-]*)$/i;

export function parsePackageSpec(raw: string): PackageSpec {
  const value = raw.trim();
  if (!value) throw new Error("Enter a package name, for example date-fns or @floating-ui/dom@latest.");

  let name = value;
  let requested = "latest";
  const splitAt = value.startsWith("@") ? value.indexOf("@", value.indexOf("/") + 1) : value.lastIndexOf("@");
  if (splitAt > 0) {
    name = value.slice(0, splitAt);
    requested = value.slice(splitAt + 1) || "latest";
  }
  if (!NAME.test(name) || name.length > 214) {
    throw new Error("That is not a valid npm package name. Scoped packages look like @scope/name.");
  }
  return { name: name.toLowerCase(), requested };
}

export function resolveManifest(packument: Packument, requested: string): PackageManifest {
  const tagged = packument["dist-tags"]?.[requested];
  const exact = valid(requested) ? requested : undefined;
  const matching = exact || tagged || maxSatisfying(Object.keys(packument.versions), requested, { includePrerelease: false });
  if (!matching || !packument.versions[matching]) {
    throw new Error(`No published version matches “${requested}”. Try a version or npm dist-tag.`);
  }
  return packument.versions[matching];
}
