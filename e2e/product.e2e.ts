import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { installCompletedMeasurementFixture, registryOrigin } from "./npm-fixture";

async function holdPackageDetails(page: Page, packageName: string) {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  await page.route(`${registryOrigin}/-/v1/search?*`, async (route) => {
    const requested = new URL(route.request().url()).searchParams.get("text");
    if (requested !== packageName) { await route.fallback(); return; }
    await route.fulfill({ contentType: "application/json", body: JSON.stringify({ objects: [{ package: { name: packageName } }] }) });
  });
  await page.route(`${registryOrigin}/${packageName}`, async (route) => {
    await gate;
    try { await route.fulfill({ contentType: "application/json", body: JSON.stringify({ name: packageName, "dist-tags": {}, versions: {} }) }); } catch { /* the browser cancelled this request */ }
  });
  return release;
}

test("home is clear, keyboard-ready, and accessible", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page).toHaveTitle("Package Cost Explorer — Compare npm package costs");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Compare npm package costs before you install.");
  await expect(page.getByText(/For frontend and Node developers.*installed size.*bundle size/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Try it with sample data/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use date-fns" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use lodash-es" })).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip-link")).toBeFocused();
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations.filter((issue) => ["serious", "critical"].includes(issue.impact || ""))).toEqual([]);
  expect(errors).toEqual([]);
});

test("skip link moves focus past the header on app routes and the static 404", async ({ page }) => {
  for (const route of ["/", "/demo", "/privacy", "/terms", "/not-a-real-route", "/404.html"]) {
    await test.step(route, async () => {
      await page.goto(route);
      const skipLink = page.getByRole("link", { name: "Skip to main content" });
      await skipLink.focus();
      await expect(skipLink).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main")).toBeFocused();
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.closest("main")?.id)).toBe("main");
    });
  }
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
  await page.evaluate(() => window.scrollTo(0, 676));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);
  await page.evaluate(() => (document.querySelector('a[href="/demo"]') as HTMLAnchorElement).click());
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect(page.locator("#route-status")).toHaveText(/page loaded/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);
  await page.goForward();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("h1")).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(2);
});

test("cancelling a first measurement reports that no report was created", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The cancellation recovery paths run once on desktop.");
  const release = await holdPackageDetails(page, "cancel-package");
  await page.goto("/");
  await page.getByLabel("Package and version").fill("cancel-package@latest");
  await page.getByRole("button", { name: "Measure this package" }).click();
  await expect(page.getByRole("heading", { name: "Reading package details…" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel measurement" }).click();
  await expect(page.locator("#package-error")).toHaveText("Measurement cancelled. No report was created.");
  await expect(page.locator("#results")).toBeHidden();
  await expect(page.getByLabel("Package and version")).toBeFocused();
  release();
});

test("cancelling a replacement keeps the completed report available", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "The cancellation recovery paths run once on desktop.");
  await installCompletedMeasurementFixture(page);
  const report = page.getByRole("heading", { name: /fixture-package 1\.0\.0/ });
  await expect(report).toBeVisible();
  const completedUrl = page.url();
  const release = await holdPackageDetails(page, "replacement-package");
  await page.getByLabel("Package and version").fill("replacement-package@latest");
  await page.getByRole("button", { name: "Measure this package" }).click();
  await expect(page.getByRole("heading", { name: "Reading package details…" })).toBeVisible();
  await expect(report).toBeVisible();
  await page.getByRole("button", { name: "Cancel measurement" }).click();
  await expect(page.locator("#package-error")).toHaveText("Measurement cancelled. The previous report remains available.");
  await expect(report).toBeVisible();
  await expect(report).toBeFocused();
  expect(page.url()).toBe(completedUrl);
  release();
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
  const facts = page.locator(".proof-points li");
  await expect(facts).toHaveCount(3);
  const lastFact = await facts.last().boundingBox();
  expect((lastFact?.y || 0) + (lastFact?.height || 0)).toBeLessThanOrEqual(844);
  await expect(page.getByText("No payment or account.")).toBeVisible();
  await expect(page.getByText("Reloads offline after the first visit.")).toBeVisible();
  await expect(page.getByText("Real measurements contact npm directly.")).toBeVisible();
});

test("phone demo controls stay available while the report is read", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific persistent demo check.");
  await page.goto("/demo");
  await page.getByRole("heading", { name: "Compare each public import" }).scrollIntoViewIfNeeded();
  const bannerBox = await page.locator(".demo-banner").boundingBox();
  expect(bannerBox?.y).toBeGreaterThanOrEqual(0);
  expect((bannerBox?.y || 0) + (bannerBox?.height || 0)).toBeLessThanOrEqual(844);
  await expect(page.getByText("Demo — sample data, nothing is saved", { exact: true })).toBeInViewport();
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeInViewport();
  await expect(page.getByRole("link", { name: "Start for real" })).toBeInViewport();
});

test("every phone interaction has a 44px touch target", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile-specific touch-target check.");
  for (const route of ["/", "/demo", "/privacy", "/terms", "/not-found", "/404.html"]) {
    await test.step(route, async () => {
      await page.goto(route);
      const undersized = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("a[href], button, input, summary")].flatMap((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        if (!rect.width || !rect.height || style.display === "none" || style.visibility === "hidden") return [];
        const target = element instanceof HTMLInputElement && element.type === "checkbox" ? element.closest<HTMLElement>("label") || element : element;
        const targetRect = target.getBoundingClientRect();
        if (targetRect.width >= 44 && targetRect.height >= 44) return [];
        return [{ name: element.getAttribute("aria-label") || element.textContent?.trim() || element.getAttribute("name") || element.tagName, width: targetRect.width, height: targetRect.height }];
      }));
      expect(undersized, `${route}: ${JSON.stringify(undersized)}`).toEqual([]);
    });
  }
});

test("legal, not-found, and install labels use direct words", async ({ page }) => {
  await page.goto("/privacy");
  await expect(page.locator(".legal-page > .kicker")).toHaveText("Effective 28 August 2026");
  await page.goto("/not-found");
  await expect(page.locator(".not-found > .kicker")).toHaveText("Page not found");
  await page.goto("/404.html");
  await expect(page.locator("main > .kicker")).toHaveText("Page not found");
  const manifest = await page.request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  expect(await manifest.json()).toMatchObject({
    name: "Package Cost Explorer",
    short_name: "Package Cost Explorer",
    description: "Compare installed size and bundle size for npm package entry points.",
  });
});
