import { logoDevKey } from "@/lib/env";
import { COMPANY_LOGO_MAX_BYTES, detectLogoMime } from "@/lib/repository/company-logo";

export type FetchedLogo = { bytes: Uint8Array; mime: string };

/**
 * Fetch a suggested logo from logo.dev. `fallback=404` makes unknown domains fail instead of
 * returning a generated monogram, which would otherwise be stored as if it were the real mark.
 */
export async function fetchLogoDevLogo(domain: string): Promise<FetchedLogo | { error: string; status: number }> {
  const key = logoDevKey();
  if (!key) return { error: "logo.dev key not configured (PUBLIC_LOGO_DEV_KEY)", status: 503 };

  const url = `https://img.logo.dev/${encodeURIComponent(domain)}?token=${encodeURIComponent(key)}&size=256&format=png&fallback=404`;
  const res = await fetch(url, { cache: "no-store" });
  if (res.status === 404) return { error: `logo.dev has no logo for ${domain}`, status: 404 };
  if (!res.ok) return { error: `logo.dev returned HTTP ${res.status}`, status: 502 };

  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > COMPANY_LOGO_MAX_BYTES) return { error: "Suggested logo is larger than 1 MB", status: 502 };
  const mime = detectLogoMime(bytes);
  if (!mime) return { error: "logo.dev response was not an image", status: 502 };
  return { bytes, mime };
}
