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

  it("falls back through module, browser string, main, and index", () => {
    expect(listPublicEntries({ name: "old", version: "1", module: "esm.js", main: "cjs.js" })[0]?.target).toBe("esm.js");
    expect(listPublicEntries({ name: "bare", version: "1" })[0]?.target).toBe("index.js");
  });
});
