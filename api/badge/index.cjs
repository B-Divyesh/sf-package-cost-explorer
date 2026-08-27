"use strict";

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&apos;" })[character]);
}

function compact(value, fallback) {
  const text = String(value || fallback).trim().replace(/\s+/g, " ");
  return text.slice(0, 96) || fallback;
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return "size unavailable";
  if (bytes < 1024) return `${Math.round(bytes)} B gzip`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB gzip`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB gzip`;
}

function renderBadge(query) {
  const packageName = compact(query.package, "npm package");
  const version = compact(query.version, "latest");
  const left = `${packageName}@${version}`;
  const right = formatBytes(query.gzip);
  const leftWidth = Math.max(104, Math.min(620, left.length * 7 + 18));
  const rightWidth = Math.max(104, right.length * 7 + 18);
  const width = leftWidth + rightWidth;
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(left)}: ${escapeXml(right)}" width="${width}" height="28" viewBox="0 0 ${width} 28"><title>${escapeXml(left)}: ${escapeXml(right)}</title><rect width="${leftWidth}" height="28" fill="#121513"/><rect x="${leftWidth}" width="${rightWidth}" height="28" fill="#006f7a"/><g fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="12"><text x="9" y="18">${escapeXml(left)}</text><text x="${leftWidth + 9}" y="18">${escapeXml(right)}</text></g></svg>`;
}

function response(query) {
  return {
    status: 200,
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "public, max-age=300",
      "x-content-type-options": "nosniff",
    },
    body: renderBadge(query),
  };
}

async function index(context, req) {
  context.res = response((req && req.query) || {});
}

module.exports = { index, renderBadge, response };
