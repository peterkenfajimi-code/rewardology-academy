import { describe, expect, it } from "vitest";
import {
  clientIpFromHeaders,
  geoFromHeaders,
  parseNetlifyGeoHeader,
} from "@/lib/geo/resolveLocation";

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

  it("reads Netlify x-nf-geo header", () => {
    const payload = {
      city: "Austin",
      country: { code: "US", name: "United States" },
      subdivision: { code: "TX", name: "Texas" },
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const headers = new Headers({ "x-nf-geo": encoded });
    expect(parseNetlifyGeoHeader(headers)).toEqual({
      countryCode: "US",
      countryName: "United States",
      region: "Texas",
      city: "Austin",
    });
    expect(geoFromHeaders(headers)).toEqual({
      countryCode: "US",
      countryName: "United States",
      region: "Texas",
      city: "Austin",
    });
  });

  it("prefers Netlify geo over x-country-only header", () => {
    const payload = {
      city: "Seattle",
      country: { code: "US", name: "United States" },
      subdivision: { name: "Washington" },
    };
    const encoded = Buffer.from(JSON.stringify(payload)).toString("base64");
    const headers = new Headers({
      "x-nf-geo": encoded,
      "x-country": "US",
    });
    expect(geoFromHeaders(headers).city).toBe("Seattle");
    expect(geoFromHeaders(headers).region).toBe("Washington");
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
