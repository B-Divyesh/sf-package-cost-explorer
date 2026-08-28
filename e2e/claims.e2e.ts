import { expect, test } from "@playwright/test";

test("@claim:sample-report opens a complete package cost report", async ({ page }) => {
  await page.goto("/?demo=1");
  await expect(page.getByRole("heading", { name: /date-fns 4\.1\.0/ })).toBeVisible();
  await expect(page.locator(".fact-strip").getByText("Installed size", { exact: true })).toBeVisible();
  await expect(page.getByText("21.73 MB").first()).toBeVisible();
  await expect(page.locator(".measure-table tbody tr")).toHaveCount(3);
  await expect(page.locator(".measure-table tbody tr").nth(1)).toContainText("./addDays");
  await expect(page.locator(".measure-table tbody tr").nth(1)).toContainText("608 B");
});

test("@claim:demo-isolation keeps sample data out of real storage", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.addInitScript(() => localStorage.setItem("real:private", "do-not-read"));
  await page.goto("/demo");
  await expect(page.getByText("Demo — sample data, nothing is saved", { exact: true })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("do-not-read");
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.locator("#demo-status")).toHaveText("Sample reset.");
  const storage = await page.evaluate(async () => ({ local: Object.fromEntries(Object.entries(localStorage)), session: Object.fromEntries(Object.entries(sessionStorage)), databases: "databases" in indexedDB ? (await indexedDB.databases()).map((item) => item.name) : [] }));
  expect(storage.local).toEqual({ "real:private": "do-not-read" });
  expect(storage.session).toEqual({});
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

test("@claim:npm-direct sends a real lookup to npm and no analysis endpoint", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.route("https://registry.npmjs.org/-/v1/search**", async (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ objects: [] }) }));
  await page.goto("/demo");
  await page.getByRole("link", { name: "Start for real" }).click();
  await page.getByLabel("Package and version").fill("sample-package@latest");
  await page.getByRole("button", { name: "Measure this package" }).click();
  await expect(page.locator("#package-error")).toContainText("npm has no published package");
  expect(requests.some((url) => url.startsWith("https://registry.npmjs.org/-/v1/search"))).toBe(true);
  expect(requests.some((url) => /\/api\/(analysis|lookup)/.test(url))).toBe(false);
});

test("@claim:no-account-analytics has no account, tracking, or payment flow", async ({ page, context }) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/demo");
  await page.getByRole("link", { name: "Privacy", exact: true }).first().click();
  await expect(page.getByText(/uses no account, analytics, tracking cookies, or saved reports/)).toBeVisible();
  expect(await context.cookies()).toEqual([]);
  expect(await page.locator('input[type="password"], input[type="email"]').count()).toBe(0);
  expect(requests.some((url) => /google-analytics|segment|plausible|stripe|dodo/i.test(url))).toBe(false);
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
