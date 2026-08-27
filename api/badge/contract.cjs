"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { response } = require("./index.cjs");

test("per-report badge preserves package, version, and gzip in an accessible SVG", () => {
  const measured = response({ package: "nanoid", version: "5.1.5", gzip: "473" });
  const other = response({ package: "date-fns", version: "4.1.0", gzip: "999999" });
  assert.equal(measured.status, 200);
  assert.equal(measured.headers["content-type"], "image/svg+xml; charset=utf-8");
  assert.equal(measured.headers["cache-control"], "public, max-age=300");
  assert.equal(measured.headers["content-security-policy"], "default-src 'none'; sandbox");
  assert.match(measured.body, /role="img"/);
  assert.match(measured.body, /nanoid@5\.1\.5/);
  assert.match(measured.body, /473 B gzip/);
  assert.notEqual(measured.body, other.body);
  assert.match(other.body, /date-fns@4\.1\.0/);
  assert.match(other.body, /977 kB gzip/);
});

test("hostile query text is inert and malformed gzip is not trusted", () => {
  const badge = response({
    package: '<script>alert(1)</script>',
    version: '\" onload=\"alert(1)',
    gzip: '1e9',
  }).body;
  assert.match(badge, /&lt;script&gt;/);
  assert.match(badge, /&quot; event-&quot;alert\(1\)/);
  assert.doesNotMatch(badge, /<script\b|onload\s*=/i);
  assert.match(badge, /size unavailable/);
});
