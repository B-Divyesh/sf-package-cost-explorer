import { describe, expect, it } from "vitest";
import { badgeDataUrl, badgeLabel, badgeUrl, renderBadgeSvg } from "./badge";

describe("embeddable badge data", () => {
  it("creates a static live route with the report values and a self-contained SVG embed", () => {
    const values = { packageName: "date-fns", version: "4.1.0", gzip: 1536 };
    expect(badgeUrl("https://package-cost-explorer.sociobot.in", values)).toBe("https://package-cost-explorer.sociobot.in/badge.svg?package=date-fns&version=4.1.0&gzip=1536");
    expect(renderBadgeSvg(values)).toContain("date-fns@4.1.0");
    expect(renderBadgeSvg(values)).toContain("1.5 kB gzip");
    expect(badgeDataUrl(values).startsWith("data:image/svg+xml,")).toBe(true);
  });

  it("escapes untrusted values instead of emitting executable SVG markup", () => {
    const values = { packageName: "<script>alert(1)</script>", version: '\" onload="alert(1)', gzip: Number.NaN };
    expect(renderBadgeSvg(values)).not.toContain("<script>");
    expect(renderBadgeSvg(values)).toContain("&lt;script&gt;");
    expect(badgeLabel(values)).toContain("size unavailable");
  });
});
