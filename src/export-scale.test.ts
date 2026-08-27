import { describe, expect, it } from "vitest";
import { listPublicEntries } from "./exports-map";
import type { PackageManifest } from "./types";

describe("published export scale regression", () => {
  it("enumerates every date-fns@4.1.0 runtime subpath, never its .d.ts declarations", async () => {
    const response = await fetch("https://registry.npmjs.org/date-fns/4.1.0");
    expect(response.ok).toBe(true);
    const manifest = await response.json() as PackageManifest;
    const entries = listPublicEntries(manifest);
    expect(entries).toHaveLength(741);
    expect(entries.find((entry) => entry.subpath === "./add")).toMatchObject({ target: "./add.js", condition: "import" });
    expect(entries.some((entry) => entry.target.endsWith(".d.ts") || entry.target.endsWith(".d.cts"))).toBe(false);
  }, 30_000);
});
