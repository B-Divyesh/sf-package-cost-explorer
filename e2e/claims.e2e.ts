import { expect, test } from "@playwright/test";
import { installCompletedMeasurementFixture, registryOrigin } from "./npm-fixture";

function expectOnlyAllowedRequests(requests: string[], productOrigin: string) {
  const allowed = new Set([productOrigin, registryOrigin]);
  const unexpected = requests.filter((request) => !allowed.has(new URL(request).origin));
  expect(unexpected, `unexpected request URLs: ${unexpected.join(", ")}`).toEqual([]);
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
  expect(requests).toContain(`${registryOrigin}/-/v1/search?text=fixture-package&size=250`);
  expect(requests).toContain(`${registryOrigin}/fixture-package`);
  expect(requests).toContain(`${registryOrigin}/fixture-dependency`);
  expect(requests).toContain(`${registryOrigin}/fixture-package/-/fixture-package-1.0.0.tgz`);
  expect(requests.every((url) => new URL(url).origin === registryOrigin)).toBe(true);
  expectOnlyAllowedRequests(allRequests, new URL(page.url()).origin);
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
  expectOnlyAllowedRequests(allRequests, new URL(page.url()).origin);
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
