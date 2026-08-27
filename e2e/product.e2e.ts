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
