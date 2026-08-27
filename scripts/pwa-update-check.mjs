import { createServer } from "node:http";
import { mkdtempSync, cpSync, readFileSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname, normalize } from "node:path";
import { spawnSync } from "node:child_process";
import { chromium } from "playwright";

const root = mkdtempSync(join(tmpdir(), "package-ledger-pwa-"));
let activeDirectory = "";
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".webp": "image/webp", ".avif": "image/avif", ".wasm": "application/wasm" };

function build(revision) {
  const result = spawnSync("npm", ["run", "build"], { cwd: process.cwd(), env: { ...process.env, BUILD_REVISION: revision }, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  const target = join(root, revision);
  cpSync(join(process.cwd(), "dist"), target, { recursive: true });
  return target;
}

function fileFor(url) {
  const path = url.pathname === "/" ? "index.html" : normalize(url.pathname).replace(/^[/\\]+/, "");
  if (path.includes("..")) return undefined;
  return join(activeDirectory, path);
}

try {
  activeDirectory = build("pwa-first");
  const server = createServer((request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const file = fileFor(url);
    try {
      if (!file || !statSync(file).isFile()) throw new Error("not found");
      response.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream", "cache-control": url.pathname === "/sw.js" ? "no-cache" : "no-store" });
      response.end(readFileSync(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  const origin = `http://127.0.0.1:${address.port}`;
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(origin);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  if (await page.locator('meta[name="app-build"]').getAttribute("content") !== "pwa-first") throw new Error("first PWA shell did not load");

  activeDirectory = build("pwa-second");
  await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());
  await page.waitForFunction(async () => caches.has("package-ledger-shell-pwa-second"));
  await page.reload();
  if (await page.locator('meta[name="app-build"]').getAttribute("content") !== "pwa-second") throw new Error("ordinary app deployment retained the stale shell");

  await context.setOffline(true);
  await page.reload();
  if (await page.locator('meta[name="app-build"]').getAttribute("content") !== "pwa-second") throw new Error("updated PWA shell is not available offline");
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log("PWA update and offline shell check passed.");
} finally {
  rmSync(root, { recursive: true, force: true });
}
