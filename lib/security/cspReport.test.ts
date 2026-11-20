import { describe, expect, it } from "vitest";
import { parseCspReport, stripUri } from "@/lib/security/cspReport";

describe("stripUri", () => {
  it("drops query and fragment", () => {
    expect(stripUri("https://example.com/app?token=secret#hash")).toBe("https://example.com/app");
  });

  it("returns empty for non-strings", () => {
    expect(stripUri(null)).toBe("");
    expect(stripUri(12)).toBe("");
  });
});

describe("parseCspReport", () => {
  it("reads Reporting API bodies", () => {
    const parsed = parseCspReport({
      body: {
        effectiveDirective: "script-src",
        blockedURL: "https://evil.example/x.js?q=1",
        documentURL: "https://rewardologyacademy.com/benefits-repository?ref=1",
      },
    });
    expect(parsed).toEqual({
      directive: "script-src",
      blockedUri: "https://evil.example/x.js",
      documentUri: "https://rewardologyacademy.com/benefits-repository",
      blockedHost: "evil.example",
    });
  });

  it("reads legacy csp-report bodies", () => {
    const parsed = parseCspReport({
      "csp-report": {
        "violated-directive": "img-src",
        "blocked-uri": "https://cdn.example/a.png",
        "document-uri": "https://rewardologyacademy.com/",
      },
    });
    expect(parsed?.directive).toBe("img-src");
    expect(parsed?.blockedUri).toBe("https://cdn.example/a.png");
  });
});
