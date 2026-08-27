import { describe, expect, it } from "vitest";
import { listPublicEntries, resolveExport } from "./exports-map";

describe("exports map resolution", () => {
  it("prefers browser and import conditions", () => {
    const manifest = {
      name: "doors",
      version: "1.0.0",
      exports: {
        ".": { node: "./node.js", browser: "./browser.js", default: "./index.js" },
        "./client": { require: "./client.cjs", import: "./client.mjs" },
        "./feature/*": "./feature/*.js",
      },
    };
    expect(listPublicEntries(manifest)).toEqual([
      { subpath: ".", label: "doors", target: "./browser.js", condition: "browser" },
      { subpath: "./client", label: "doors/client", target: "./client.mjs", condition: "import" },
    ]);
    expect(resolveExport(manifest, "./client")).toBe("./client.mjs");
  });

  it("uses a runtime default below an import condition instead of its TypeScript declaration", () => {
    const entries = listPublicEntries({
      name: "date-fns",
      version: "4.1.0",
      exports: {
        ".": { import: { types: "./index.d.ts", default: "./index.js" }, require: { types: "./index.d.cts", default: "./index.cjs" } },
        "./add": { import: { types: "./add.d.ts", default: "./add.js" }, require: { types: "./add.d.cts", default: "./add.cjs" } },
      },
    });
    expect(entries).toEqual([
      { subpath: ".", label: "date-fns", target: "./index.js", condition: "import" },
      { subpath: "./add", label: "date-fns/add", target: "./add.js", condition: "import" },
    ]);
  });

  it("does not cap a date-fns-scale explicit exports map", () => {
    const exportsMap: Record<string, unknown> = {
      ".": { import: { types: "./index.d.ts", default: "./index.js" } },
    };
    for (let index = 1; index < 741; index += 1) {
      exportsMap[`./entry-${index}`] = { import: { types: `./entry-${index}.d.ts`, default: `./entry-${index}.js` } };
    }
    const entries = listPublicEntries({ name: "date-fns", version: "4.1.0", exports: exportsMap });
    expect(entries).toHaveLength(741);
    expect(entries.at(-1)).toMatchObject({ target: expect.stringMatching(/\.js$/), condition: "import" });
    expect(entries.some((entry) => entry.target.endsWith(".d.ts"))).toBe(false);
  });

  it("expands pattern exports from the published archive and resolves them", () => {
    const manifest = { name: "patterns", version: "1", exports: { "./feature/*": "./dist/feature/*.js" } };
    expect(listPublicEntries(manifest, ["dist/feature/one.js", "dist/feature/two.js", "package.json"])).toEqual([
      { subpath: "./feature/one", label: "patterns/feature/one", target: "./dist/feature/one.js", condition: "default" },
      { subpath: "./feature/two", label: "patterns/feature/two", target: "./dist/feature/two.js", condition: "default" },
    ]);
    expect(resolveExport(manifest, "./feature/one")).toBe("./dist/feature/one.js");
  });

  it("falls back through module, browser string, main, and index", () => {
    expect(listPublicEntries({ name: "old", version: "1", module: "esm.js", main: "cjs.js" })[0]?.target).toBe("esm.js");
    expect(listPublicEntries({ name: "bare", version: "1" })[0]?.target).toBe("index.js");
  });
});
