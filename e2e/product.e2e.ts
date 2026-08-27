import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home is keyboard-ready and has no serious accessibility violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("main")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter((issue) => ["serious", "critical"].includes(issue.impact || ""))).toEqual([]);
});

test("a real npm package produces a complete local report", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The same workflow is covered once against the public npm registry.");
  await page.goto("/");
  await page.getByLabel("Package and version").fill("nanoid@5.1.5");
  await page.getByRole("button", { name: /Run the numbers/ }).click();
  await expect(page.getByRole("heading", { name: /nanoid/ })).toBeVisible({ timeout: 120_000 });
  await expect(page.locator(".measure-table tbody tr").first()).toContainText(/(?:B|kB|MB)/);
  await expect(page.getByText("Measured locally")).toBeVisible();
  expect(page.url()).toContain("nanoid%405.1.5");
  const badgeUrl = await page.locator("#badge-link").getAttribute("href");
  expect(badgeUrl).toMatch(/\/badge\.svg\?package=nanoid&version=5\.1\.5&gzip=\d+$/);
  const badge = await page.request.get(badgeUrl!);
  expect(badge.status()).toBe(200);
  expect(badge.headers()["content-type"]).toContain("image/svg+xml");
  const svg = await badge.text();
  expect(svg).toContain('role="img"');
  expect(svg).toContain("nanoid@5.1.5");
  expect(svg).toMatch(/\d+ B gzip/);
  expect(svg).not.toMatch(/<script|onload\s*=/i);
  const hostile = await page.request.get("/badge.svg?package=%3Cscript%3Ealert(1)%3C%2Fscript%3E&version=%22%20onload%3D%22alert(1)&gzip=1e9");
  const hostileSvg = await hostile.text();
  expect(hostile.status()).toBe(200);
  expect(hostileSvg).toContain("&lt;script&gt;");
  expect(hostileSvg).toContain("size unavailable");
  expect(hostileSvg).not.toMatch(/<script\b|onload\s*=/i);
});

test("mobile page does not overflow and legal routes render one heading", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific layout check.");
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.goto("/privacy");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: /Privacy/ })).toBeVisible();
});
