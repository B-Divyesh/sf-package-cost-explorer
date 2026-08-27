import { describe, expect, it } from "vitest";
import badge from "../api/badge/index.cjs";

describe("embeddable badge worker", () => {
  it("serves a safe SVG with the requested package and measured gzip bytes", () => {
    const response = badge.response({ package: "date-fns", version: "4.1.0", gzip: "1536" });
    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("image/svg+xml");
    expect(response.body).toContain("date-fns@4.1.0");
    expect(response.body).toContain("1.5 kB gzip");
    expect(response.body).toContain('role="img"');
  });

  it("escapes untrusted query values instead of emitting executable SVG markup", () => {
    const response = badge.response({ package: '<script>alert(1)</script>', version: '" onload="alert(1)', gzip: "NaN" });
    expect(response.body).not.toContain("<script>");
    expect(response.body).toContain("&lt;script&gt;");
    expect(response.body).toContain("size unavailable");
  });
});
