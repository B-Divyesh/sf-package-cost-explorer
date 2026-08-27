import { describe, expect, it } from "vitest";
import { parsePackageSpec, resolveManifest } from "./package-spec";
import type { Packument } from "./types";

const packument: Packument = {
  name: "example",
  "dist-tags": { latest: "2.0.0", next: "3.0.0-beta.1" },
  versions: {
    "1.4.0": { name: "example", version: "1.4.0" },
    "2.0.0": { name: "example", version: "2.0.0" },
    "3.0.0-beta.1": { name: "example", version: "3.0.0-beta.1" },
  },
};

describe("package spec parsing", () => {
  it("defaults unscoped packages to latest", () => expect(parsePackageSpec(" date-fns ")).toEqual({ name: "date-fns", requested: "latest" }));
  it("separates scoped versions after the slash", () => expect(parsePackageSpec("@floating-ui/dom@1.6.0")).toEqual({ name: "@floating-ui/dom", requested: "1.6.0" }));
  it("preserves a scoped package without a version", () => expect(parsePackageSpec("@scope/name")).toEqual({ name: "@scope/name", requested: "latest" }));
  it("rejects URLs and incomplete scopes", () => {
    expect(() => parsePackageSpec("https://npmjs.com/x")).toThrow(/valid npm package/);
    expect(() => parsePackageSpec("@scope")).toThrow(/valid npm package/);
  });
});

describe("version resolution", () => {
  it("resolves tags, exact versions, and ranges", () => {
    expect(resolveManifest(packument, "latest").version).toBe("2.0.0");
    expect(resolveManifest(packument, "1.4.0").version).toBe("1.4.0");
    expect(resolveManifest(packument, "^1").version).toBe("1.4.0");
  });
  it("reports an actionable error for a missing version", () => expect(() => resolveManifest(packument, "^9")).toThrow(/No published version/));
});
