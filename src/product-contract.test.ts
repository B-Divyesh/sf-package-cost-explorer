import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const html = readFileSync("index.html", "utf8");
const source = readFileSync("src/main.ts", "utf8");
const css = readFileSync("src/style.css", "utf8");

describe("static product contract", () => {
  it("ships document language, title, description, and scalable viewport", () => {
    expect(html).toMatch(/<html lang="en">/);
    expect(html).toMatch(/<title>[^<]+<\/title>/);
    expect(html).toMatch(/name="description"/);
    expect(html).not.toMatch(/user-scalable=no/);
  });
  it("renders a single explorer h1 and semantic landmarks", () => {
    const explorer = source.slice(source.indexOf("function renderExplorer"), source.indexOf("interface AppState"));
    expect(explorer.match(/<h1\b/g)).toHaveLength(1);
    expect(explorer).toContain('<main id="main">');
    expect(source).toContain('<header class="masthead">');
    expect(source).toContain('<footer class="footer">');
  });
  it("includes useful image alt text, focus treatment, and reduced motion", () => {
    expect(source).toMatch(/alt="An opened paper package/);
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
  it("ships an unbounded export report, worker badge route, and update-aware service worker registration", () => {
    const config = readFileSync("public/staticwebapp.config.json", "utf8");
    const vite = readFileSync("vite.config.ts", "utf8");
    expect(source).not.toContain("entries.slice(0, 4)");
    expect(source).not.toContain("selected.length > 8");
    expect(source).toContain("/badge.svg?");
    expect(source).toContain('updateViaCache: "none"');
    expect(source).toContain("const hadController");
    expect(config).toContain('"/badge.svg"');
    expect(readFileSync("api/package.json", "utf8")).toContain('"@azure/functions"');
    expect(readFileSync("api/src/functions/badge.cjs", "utf8")).toContain('app.http("badge"');
    expect(vite).toContain("package-ledger-shell-${buildId}");
  });
});
