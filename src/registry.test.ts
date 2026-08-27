import { describe, expect, it } from "vitest";
import { versionHistory } from "./registry";

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
