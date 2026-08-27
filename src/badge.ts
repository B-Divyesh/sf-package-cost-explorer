export interface BadgeValues {
  packageName: string;
  version: string;
  gzip?: number;
}

function compact(value: string, fallback: string): string {
  const text = value.trim().replace(/\s+/g, " ");
  return text.slice(0, 96) || fallback;
}

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

export function formatGzip(value: number | undefined): string {
  if (!Number.isFinite(value) || (value ?? 0) < 0) return "size unavailable";
  const bytes = value!;
  if (bytes < 1024) return `${Math.round(bytes)} B gzip`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} kB gzip`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB gzip`;
}

export function badgeLabel(values: BadgeValues): string {
  return `${compact(values.packageName, "npm package")}@${compact(values.version, "latest")}: ${formatGzip(values.gzip)}`;
}

/**
 * This is intentionally a real static URL. Azure Static Web Apps serves the
 * checked-in SVG directly, including when it has the informational query
 * values used by the report. It is safe to fetch or link in every SWA tier.
 */
export function badgeUrl(origin: string, values: BadgeValues): string {
  const params = new URLSearchParams({
    package: compact(values.packageName, "npm package"),
    version: compact(values.version, "latest"),
    gzip: String(values.gzip ?? 0),
  });
  return `${origin}/badge.svg?${params}`;
}

/** A self-contained SVG retains the measured values when an embed is copied. */
export function renderBadgeSvg(values: BadgeValues): string {
  const left = `${compact(values.packageName, "npm package")}@${compact(values.version, "latest")}`;
  const right = formatGzip(values.gzip);
  const label = `${left}: ${right}`;
  const leftWidth = Math.max(104, Math.min(620, left.length * 7 + 18));
  const rightWidth = Math.max(104, right.length * 7 + 18);
  const width = leftWidth + rightWidth;
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(label)}" width="${width}" height="28" viewBox="0 0 ${width} 28"><title>${escapeXml(label)}</title><rect width="${leftWidth}" height="28" fill="#121513"/><rect x="${leftWidth}" width="${rightWidth}" height="28" fill="#006f7a"/><g fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="12"><text x="9" y="18">${escapeXml(left)}</text><text x="${leftWidth + 9}" y="18">${escapeXml(right)}</text></g></svg>`;
}

export function badgeDataUrl(values: BadgeValues): string {
  return `data:image/svg+xml,${encodeURIComponent(renderBadgeSvg(values))}`;
}
