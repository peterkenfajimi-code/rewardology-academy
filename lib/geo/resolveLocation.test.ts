import { describe, expect, it } from "vitest";
import { clientIpFromHeaders, geoFromHeaders } from "@/lib/geo/resolveLocation";

describe("geoFromHeaders", () => {
  it("reads Vercel geo headers", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "ng",
      "x-vercel-ip-country-region": "LA",
      "x-vercel-ip-city": "Lagos",
    });
    expect(geoFromHeaders(headers)).toEqual({
      countryCode: "NG",
      countryName: null,
      region: "LA",
      city: "Lagos",
    });
  });

  it("reads Cloudflare country header", () => {
    const headers = new Headers({ "cf-ipcountry": "GB" });
    expect(geoFromHeaders(headers)).toEqual({
      countryCode: "GB",
      countryName: null,
      region: null,
      city: null,
    });
  });

  it("returns empty when no geo headers exist", () => {
    expect(geoFromHeaders(new Headers())).toEqual({
      countryCode: null,
      countryName: null,
      region: null,
      city: null,
    });
  });
});

describe("clientIpFromHeaders", () => {
  it("prefers Netlify client IP header", () => {
    const headers = new Headers({
      "x-nf-client-connection-ip": "203.0.113.10",
      "x-forwarded-for": "198.51.100.1, 203.0.113.10",
    });
    expect(clientIpFromHeaders(headers)).toBe("203.0.113.10");
  });

  it("falls back to first forwarded-for IP", () => {
    const headers = new Headers({ "x-forwarded-for": "198.51.100.1, 203.0.113.10" });
    expect(clientIpFromHeaders(headers)).toBe("198.51.100.1");
  });
});
