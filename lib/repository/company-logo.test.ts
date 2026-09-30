import { describe, expect, it } from "vitest";
import { companyInitials, detectLogoMime, normalizeDomain } from "@/lib/repository/company-logo";

describe("companyInitials", () => {
  it("skips corporate suffixes and parentheticals", () => {
    expect(companyInitials("Guaranty Trust Holding Company Plc")).toBe("GT");
    expect(companyInitials("Scancom PLC (MTN Ghana)")).toBe("SC");
    expect(companyInitials("MTN Group Ltd")).toBe("MT");
    expect(companyInitials("GCB Bank PLC")).toBe("GB");
  });
});

describe("normalizeDomain", () => {
  it("reduces URLs to a bare host", () => {
    expect(normalizeDomain("https://www.gtcoplc.com/who-we-are")).toBe("gtcoplc.com");
    expect(normalizeDomain("safaricom.co.ke")).toBe("safaricom.co.ke");
    expect(normalizeDomain("not a domain")).toBeNull();
    expect(normalizeDomain("")).toBeNull();
  });
});

describe("detectLogoMime", () => {
  it("identifies images by their bytes", () => {
    expect(detectLogoMime(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0]))).toBe("image/png");
    expect(detectLogoMime(new TextEncoder().encode('<?xml version="1.0"?><svg xmlns="x"/>'))).toBe("image/svg+xml");
    expect(detectLogoMime(new TextEncoder().encode("<html>not an image</html>"))).toBeNull();
  });
});
