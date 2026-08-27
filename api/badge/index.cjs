"use strict";

// This module has no runtime dependency so the response contract can be
// exercised locally as well as by the managed Azure Function.
function xmlText(value) {
  return Array.from(String(value)).filter((character) => {
    const point = character.codePointAt(0);
    return point === 0x9 || point === 0xa || point === 0xd ||
      (point >= 0x20 && point <= 0xd7ff) ||
      (point >= 0xe000 && point <= 0xfffd) ||
      (point >= 0x10000 && point <= 0x10ffff);
  }).join("");
}

function escapeXml(value) {
  return xmlText(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[character]);
}

function compact(value, fallback) {
  const text = xmlText(value == null ? fallback : value).trim().replace(/\s+/g, " ")
    // Text is XML-escaped below; also defang event-attribute-shaped input so
    // a copied source can never be mistaken for executable SVG markup.
    .replace(/\bon[a-z]+\s*=/gi, "event-");
  return text.slice(0, 96) || fallback;
}

function formatGzip(value) {
  // Numeric-only parsing avoids surprising labels such as a unit-bearing
  // string or JavaScript's Infinity. The maximum preserves exact safe bytes.
  if (!/^(?:0|[1-9]\d*)(?:\.\d+)?$/.test(String(value ?? ""))) return "size unavailable";
  const bytes = Number(value);
  if (!Number.isSafeInteger(bytes) || bytes < 0) return "size unavailable";
  if (bytes < 1024) return `${bytes} B gzip`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB gzip`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB gzip`;
}

function renderBadge(query = {}) {
  const packageName = compact(query.package, "npm package");
  const version = compact(query.version, "latest");
  const left = `${packageName}@${version}`;
  const right = formatGzip(query.gzip);
  const label = `${left}: ${right}`;
  const leftWidth = Math.max(104, Math.min(620, left.length * 7 + 18));
  const rightWidth = Math.max(104, right.length * 7 + 18);
  const width = leftWidth + rightWidth;
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(label)}" width="${width}" height="28" viewBox="0 0 ${width} 28"><title>${escapeXml(label)}</title><rect width="${leftWidth}" height="28" fill="#121513"/><rect x="${leftWidth}" width="${rightWidth}" height="28" fill="#006f7a"/><g fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="12"><text x="9" y="18">${escapeXml(left)}</text><text x="${leftWidth + 9}" y="18">${escapeXml(right)}</text></g></svg>`;
}

function response(query) {
  return {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
      "content-security-policy": "default-src 'none'; sandbox",
      "referrer-policy": "no-referrer",
      "x-content-type-options": "nosniff",
    },
    body: renderBadge(query),
  };
}

module.exports = { escapeXml, formatGzip, renderBadge, response };
