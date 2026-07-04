export type GeoLocation = {
  countryCode: string | null;
  countryName: string | null;
  region: string | null;
  city: string | null;
};

const EMPTY: GeoLocation = {
  countryCode: null,
  countryName: null,
  region: null,
  city: null,
};

/** Extract the client IP from common CDN / proxy headers. */
export function clientIpFromHeaders(headers: Headers): string | null {
  const netlify = headers.get("x-nf-client-connection-ip");
  if (netlify) return netlify.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || null;

  const real = headers.get("x-real-ip");
  if (real) return real.trim();

  return null;
}

function isPrivateIp(ip: string): boolean {
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("fe80:")) return true;
  if (ip.startsWith("10.") || ip.startsWith("192.168.")) return true;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) return true;
  return false;
}

/** Read geo from CDN headers when the host injects them (Vercel, Cloudflare, etc.). */
export function geoFromHeaders(headers: Headers): GeoLocation {
  const countryCode =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country") ||
    null;

  const region =
    headers.get("x-vercel-ip-country-region") ||
    headers.get("x-region") ||
    null;

  const city = headers.get("x-vercel-ip-city") || headers.get("x-city") || null;

  if (!countryCode) return { ...EMPTY };

  return {
    countryCode: countryCode.toUpperCase(),
    countryName: null,
    region: region?.trim() || null,
    city: city?.trim() || null,
  };
}

type IpApiResponse = {
  status?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  city?: string;
};

/** Resolve approximate location from request headers, with IP lookup fallback. */
export async function resolveLocation(request: Request): Promise<GeoLocation> {
  const fromHeaders = geoFromHeaders(request.headers);
  if (fromHeaders.countryCode) return fromHeaders;

  const ip = clientIpFromHeaders(request.headers);
  if (!ip || isPrivateIp(ip)) return { ...EMPTY };

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,countryCode,regionName,city`,
      { cache: "no-store" }
    );
    if (!res.ok) return { ...EMPTY };

    const data = (await res.json()) as IpApiResponse;
    if (data.status !== "success" || !data.countryCode) return { ...EMPTY };

    return {
      countryCode: data.countryCode.toUpperCase(),
      countryName: data.country?.trim() || null,
      region: data.regionName?.trim() || null,
      city: data.city?.trim() || null,
    };
  } catch {
    return { ...EMPTY };
  }
}
