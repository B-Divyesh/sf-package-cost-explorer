import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home is clear, keyboard-ready, and accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle("Package Cost Explorer — Compare npm package costs");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare npm package costs before you install.");
  await expect(page.getByText(/For frontend and Node developers/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Try it with sample data/ })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter((issue) => ["serious", "critical"].includes(issue.impact || ""))).toEqual([]);
  expect(errors).toEqual([]);
});

test("demo, legal, and not-found routes have distinct metadata and accessible states", async ({ page }) => {
  for (const route of ["/demo", "/privacy", "/terms", "/not-a-real-route"]) {
    await page.goto(route);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(route));
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /social-card\.jpg/);
    const audit = await new AxeBuilder({ page }).analyze();
    expect(audit.violations.filter((issue) => ["serious", "critical"].includes(issue.impact || ""))).toEqual([]);
  }
  await expect(page).toHaveTitle("Page not found — Package Cost Explorer");
  await expect(page.getByRole("heading", { name: "This package page does not exist." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toBeVisible();
});

test("client routing, back navigation, focus, and announcement work", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo", exact: true }).first().click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator("#route-status")).toHaveText(/page loaded/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
});

test("a real npm package produces a complete local report", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The public npm workflow runs once on desktop.");
  await page.goto("/");
  await page.getByLabel("Package and version").fill("nanoid@5.1.5");
  await page.getByRole("button", { name: "Measure this package" }).click();
  await expect(page.getByRole("heading", { name: /nanoid/ })).toBeVisible({ timeout: 120_000 });
  await expect(page.locator(".measure-table tbody tr").first()).toContainText(/(?:B|kB|MB)/);
  await expect(page.getByText("Measured here")).toBeVisible();
  expect(page.url()).toContain("nanoid%405.1.5");
  const badgeHref = await page.locator("#badge-link").getAttribute("href");
  expect(badgeHref).toMatch(/\/badge\.svg\?package=nanoid&version=5\.1\.5&gzip=\d+$/);
  const badge = await page.request.get(badgeHref!);
  expect(badge.status()).toBe(200);
  expect(badge.headers()["content-type"]).toContain("image/svg+xml");
  expect(await badge.text()).toContain("nanoid@5.1.5");
});

test("390px layouts do not overflow and keep controls usable", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific layout check.");
  for (const route of ["/", "/demo", "/privacy", "/not-found"]) {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, route).toBeLessThanOrEqual(1);
  }
  await page.goto("/");
  const box = await page.getByRole("link", { name: /Try it with sample data/ }).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
