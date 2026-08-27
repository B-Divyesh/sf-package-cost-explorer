import { chromium } from "playwright";

const origin = process.env.LIVE_ORIGIN || "https://package-cost-explorer.sociobot.in";
const missingName = "package-cost-explorer-definitely-missing-928342";
const browser = await chromium.launch({ headless: true });

try {
  // A new context is deliberately a clean browser profile: it exercises the
  // first service-worker install as well as the real public endpoint.
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });

  await page.goto(origin, { waitUntil: "networkidle" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (await page.locator("#update-toast").isVisible()) {
    throw new Error("a clean profile showed an update toast on its first service-worker install");
  }

  consoleErrors.length = 0;
  await page.getByLabel("Package and version").fill(missingName);
  await page.getByRole("button", { name: /Run the numbers/ }).click();
  await page.waitForFunction(() => document.querySelector("#package-error")?.textContent?.includes("npm has no published package"));
  if (consoleErrors.some((message) => /Failed to load resource.*404/i.test(message))) {
    throw new Error(`missing-package recovery produced a console 404: ${consoleErrors.join(" | ")}`);
  }

  await page.getByLabel("Package and version").fill("nanoid@5.1.5");
  await page.getByRole("button", { name: /Run the numbers/ }).click();
  await page.locator("#badge-link").waitFor({ state: "visible", timeout: 120_000 });
  const badgeUrl = await page.locator("#badge-link").getAttribute("href");
  if (!badgeUrl?.startsWith(`${origin}/badge.svg?`)) throw new Error(`UI did not generate a badge URL for ${origin}`);

  const badge = await fetch(badgeUrl);
  const type = badge.headers.get("content-type") || "";
  const body = await badge.text();
  if (badge.status !== 200 || !type.includes("image/svg+xml") || !body.startsWith("<?xml")) {
    throw new Error(`live badge failed: ${badge.status} ${type}`);
  }
  console.log(`Live clean-profile, missing-package, and UI-generated badge checks passed: ${badgeUrl}`);
  await context.close();
} finally {
  await browser.close();
}
