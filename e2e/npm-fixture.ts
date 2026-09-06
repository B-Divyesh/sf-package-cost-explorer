import { gzipSync, strToU8 } from "fflate";
import { expect, type Page } from "@playwright/test";

export const registryOrigin = "https://registry.npmjs.org";

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
  for (const [name, source] of Object.entries(files)) {
    const body = strToU8(source);
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

export async function installCompletedMeasurementFixture(page: Page, requests: string[] = []) {
  const tarball = fixtureTarball();
  const packageManifest = {
    name: "fixture-package", version: "1.0.0", description: "A deterministic package fixture", exports: { ".": "./index.js" }, main: "index.js",
    dependencies: { "fixture-dependency": "1.0.0" },
    dist: { tarball: `${registryOrigin}/fixture-package/-/fixture-package-1.0.0.tgz`, unpackedSize: 512 },
  };
  const dependencyManifest = {
    name: "fixture-dependency", version: "1.0.0", dist: { tarball: `${registryOrigin}/fixture-dependency/-/fixture-dependency-1.0.0.tgz`, unpackedSize: 256 },
  };
  await page.route(`${registryOrigin}/**`, async (route) => {
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
