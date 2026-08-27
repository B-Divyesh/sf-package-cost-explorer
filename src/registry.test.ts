import { describe, expect, it } from "vitest";
import { confirmPublicPackage, countDependencies, versionHistory } from "./registry";

describe("version history", () => {
  it("uses compact registry insertion order when per-version dates are unavailable", () => {
    const points = versionHistory({
      name: "paper",
      "dist-tags": { latest: "2.0.0" },
      versions: {
        "1.0.0": { name: "paper", version: "1.0.0", dist: { tarball: "a", unpackedSize: 100 } },
        "2.0.0": { name: "paper", version: "2.0.0", dist: { tarball: "b", unpackedSize: 160 } },
      },
    });
    expect(points.map((point) => point.version)).toEqual(["1.0.0", "2.0.0"]);
  });
});

describe("dependency footprint", () => {
  it("includes optional packages in the installed tree", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input) => new Response(JSON.stringify({
      name: String(input).split("/").at(-1),
      "dist-tags": { latest: "1.0.0" },
      versions: { "1.0.0": { name: "optional-child", version: "1.0.0", dist: { tarball: "x", unpackedSize: 20 } } },
    }))) as typeof fetch;
    try {
      const report = await countDependencies({
        name: "root", version: "1", dist: { tarball: "x", unpackedSize: 10 },
        dependencies: { required: "1.0.0" }, optionalDependencies: { optional: "1.0.0" },
      }, undefined, () => undefined);
      expect(report.unique).toBe(2);
      expect(report.unpackedBytes).toBe(50);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("public package confirmation", () => {
  it("turns a missing package into an ordinary successful search response", async () => {
    const originalFetch = globalThis.fetch;
    let requested = "";
    globalThis.fetch = (async (input) => {
      requested = String(input);
      return new Response(JSON.stringify({ objects: [] }));
    }) as typeof fetch;
    try {
      await expect(confirmPublicPackage("not-a-real-package")).rejects.toThrow(/no published package/);
      expect(requested).toContain("/-/v1/search?");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
