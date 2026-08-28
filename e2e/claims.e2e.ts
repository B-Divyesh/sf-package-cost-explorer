import { gzipSync, strToU8 } from "fflate";
import { expect, test, type Page } from "@playwright/test";

const registry = "https://registry.npmjs.org";

function writeText(target: Uint8Array, offset: number, value: string) {
  target.set(strToU8(value), offset);
}

function octal(value: number, width: number) {
  return `${value.toString(8).padStart(width - 1, "0")}\0`;
}

/** A tiny npm-compatible .tgz, built in the test so no external package is involved. */
function fixtureTarball() {
  const files = {
    "package/package.json": JSON.stringify({ name: "fixture-package", version: "1.0.0", description: "A deterministic package fixture", exports: { ".": "./index.js" }, main: "index.js" }),
    "package/index.js": "export const fixtureValue = 42; export default fixtureValue;",
  };
  const blocks: Uint8Array[] = [];
  for (const [name, text] of Object.entries(files)) {
    const body = strToU8(text);
    const header = new Uint8Array(512);
    writeText(header, 0, name);
    writeText(header, 100, octal(0o644, 8));
    writeText(header, 108, octal(0, 8));
    writeText(header, 116, octal(0, 8));
    writeText(header, 124, octal(body.length, 12));
    writeText(header, 136, octal(0, 12));
    header.fill(32, 148, 156);
    header[156] = 48;
    writeText(header, 257, "ustar\0");
    writeText(header, 263, "00");
    const checksum = header.reduce((total, byte) => total + byte, 0);
    writeText(header, 148, `${checksum.toString(8).padStart(6, "0")}\0 `);
    blocks.push(header, body, new Uint8Array(Math.ceil(body.length / 512) * 512 - body.length));
  }
  blocks.push(new Uint8Array(1024));
  const tar = new Uint8Array(blocks.reduce((total, block) => total + block.length, 0));
  let offset = 0;
  for (const block of blocks) { tar.set(block, offset); offset += block.length; }
  return gzipSync(tar);
}

async function installCompletedMeasurementFixture(page: Page, requests: string[]) {
  const tarball = fixtureTarball();
  const packageManifest = {
    name: "fixture-package", version: "1.0.0", description: "A deterministic package fixture", exports: { ".": "./index.js" }, main: "index.js",
    dependencies: { "fixture-dependency": "1.0.0" },
    dist: { tarball: `${registry}/fixture-package/-/fixture-package-1.0.0.tgz`, unpackedSize: 512 },
  };
  const dependencyManifest = {
    name: "fixture-dependency", version: "1.0.0", dist: { tarball: `${registry}/fixture-dependency/-/fixture-dependency-1.0.0.tgz`, unpackedSize: 256 },
  };
  await page.route(`${registry}/**`, async (route) => {
    const url = new URL(route.request().url());
    requests.push(url.href);
    if (url.pathname === "/-/v1/search") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ objects: [{ package: { name: "fixture-package" } }] }) });
      return;
    }
    if (url.pathname === "/fixture-package") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ name: "fixture-package", "dist-tags": { latest: "1.0.0" }, time: { "1.0.0": "2026-08-28T00:00:00.000Z" }, versions: { "1.0.0": packageManifest } }) });
      return;
    }
    if (url.pathname === "/fixture-dependency") {
      await route.fulfill({ contentType: "application/json", body: JSON.stringify({ name: "fixture-dependency", "dist-tags": { latest: "1.0.0" }, versions: { "1.0.0": dependencyManifest } }) });
      return;
    }
    if (url.pathname === "/fixture-package/-/fixture-package-1.0.0.tgz") {
      await route.fulfill({ contentType: "application/octet-stream", headers: { "content-length": String(tarball.length) }, body: Buffer.from(tarball) });
      return;
    }
    await route.abort();
  });
  await page.goto("/demo");
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.getByLabel("Package and version").fill("fixture-package@latest");
  await page.getByRole("button", { name: "Measure this package" }).click();
  await expect(page.getByRole("heading", { name: /fixture-package 1\.0\.0/ })).toBeVisible({ timeout: 30_000 });
}

test("@claim:sample-report opens a complete package cost report", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByRole("heading", { name: /date-fns 4\.1\.0/ })).toBeVisible();
  await expect(page.locator(".fact-strip").getByText("Installed size", { exact: true })).toBeVisible();
  await expect(page.locator(".fact-strip > div").nth(1)).toContainText("Production dependencies");
  await expect(page.locator(".fact-strip > div").nth(1)).toContainText("0");
  await expect(page.getByText("21.73 MB").first()).toBeVisible();
  await expect(page.locator(".measure-table tbody tr")).toHaveCount(3);
  await expect(page.locator(".measure-table tbody tr").nth(1)).toContainText("./addDays");
  await expect(page.locator(".measure-table tbody tr").nth(1)).toContainText("608 B");
});

test("@claim:demo-isolation keeps sample data out of real storage", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => { localStorage.setItem("real:private", "do-not-read"); sessionStorage.setItem("real:session", "keep"); });
  await page.goto("/demo");
  await expect(page.getByText("Demo — sample data, nothing is saved", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("do-not-read");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#demo-status")).toHaveText("Sample reset.");
  const storage = await page.evaluate(async () => ({ local: Object.fromEntries(Object.entries(localStorage)), session: Object.fromEntries(Object.entries(sessionStorage)), databases: "databases" in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [] }));
  expect(storage.local).toEqual({ "real:private": "do-not-read" });
  expect(storage.session).toEqual({ "real:session": "keep" });
  expect(storage.databases).toEqual([]);
  expect(requests.filter((url) => new URL(url).origin !== new URL(page.url()).origin)).toEqual([]);
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page.getByRole("heading", { name: "Compare npm package costs before you install." })).toBeVisible();
  await expect(page.locator(".demo-banner")).toHaveCount(0);
});

test("@claim:offline-reload reloads the interface offline after one visit", async ({ page, context }) => {
  await page.goto("/demo");
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText("You are offline.", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /date-fns 4\.1\.0/ })).toBeVisible();
  await page.getByRole("link", { name: "Start for real" }).click();
  await expect(page.getByRole("button", { name: "Measure this package" })).toBeDisabled();
});

test("@claim:npm-direct downloads npm package files and completes a local measurement", async ({ page }) => {
  const requests: string[] = [];
  const allRequests: string[] = [];
  page.on("request", (request) => allRequests.push(request.url()));
  await installCompletedMeasurementFixture(page, requests);
  await expect(page.locator(".fact-strip > div").nth(1)).toContainText("Production dependencies");
  await expect(page.locator(".fact-strip > div").nth(1)).toContainText("1");
  await expect(page.locator(".measure-table tbody tr")).toHaveCount(1);
  expect(requests).toContain(`${registry}/-/v1/search?text=fixture-package&size=250`);
  expect(requests).toContain(`${registry}/fixture-package`);
  expect(requests).toContain(`${registry}/fixture-dependency`);
  expect(requests).toContain(`${registry}/fixture-package/-/fixture-package-1.0.0.tgz`);
  expect(requests.every((url) => new URL(url).origin === registry)).toBe(true);
  expect(allRequests.some((url) => /\/api\/(analysis|lookup)/.test(new URL(url).pathname))).toBe(false);
});

test("@claim:no-account-analytics has no account, payment, tracking, or saved reports", async ({ page, context }) => {
  const requests: string[] = [];
  const allRequests: string[] = [];
  page.on("request", (request) => allRequests.push(request.url()));
  await installCompletedMeasurementFixture(page, requests);
  expect(await context.cookies()).toEqual([]);
  expect(await page.locator('input[type="password"], input[type="email"], input[name*="card" i]').count()).toBe(0);
  expect(allRequests.some((url) => /google-analytics|segment|plausible|stripe|dodo|chargebee/i.test(url))).toBe(false);
  const browserStorage = await page.evaluate(async () => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
    databases: "databases" in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [],
    cacheRequests: await caches.keys().then(async (keys) => (await Promise.all(keys.map(async (key) => (await caches.open(key)).keys()))).flat().map((request) => request.url)),
  }));
  expect(browserStorage.local).toEqual({});
  expect(browserStorage.session).toEqual({});
  expect(browserStorage.databases).toEqual([]);
  expect(JSON.stringify(browserStorage.cacheRequests)).not.toContain("fixture-package");
  const freshPage = await context.newPage();
  await freshPage.goto("/");
  await expect(freshPage.getByText("fixture-package", { exact: true })).toHaveCount(0);
});

test("@claim:report-sharing copies a report link and package badge", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/demo");
  await page.getByRole("button", { name: "Copy report link" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/demo$/);
  await page.getByRole("button", { name: "Copy SVG badge" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("date-fns@4.1.0");
  const badgeHref = await page.locator("#badge-link").getAttribute("href");
  const badge = await page.request.get(badgeHref!);
  expect(badge.status()).toBe(200);
  expect(await badge.text()).toContain("date-fns@4.1.0");
});
