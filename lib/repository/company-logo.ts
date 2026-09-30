export const COMPANY_LOGO_BUCKET = "company-logos";
export const COMPANY_LOGO_MAX_BYTES = 1024 * 1024;

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export function companyLogoUrl(storagePath: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL;
  if (!storagePath || !base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${COMPANY_LOGO_BUCKET}/${storagePath}`;
}

/** "Guaranty Trust Holding Company Plc" → "GT"; a single significant word gives its first two letters. */
export function companyInitials(name: string): string {
  const words = name
    .replace(/\(.*?\)/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(plc|ltd|limited|group|holding|holdings|company|the|of|and|&)$/i.test(w));
  const significant = words.length ? words : [name.trim()];
  if (significant.length === 1) return significant[0].slice(0, 2).toUpperCase();
  return significant.slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

/** Accepts "https://www.gtcoplc.com/about" or "gtcoplc.com"; returns "gtcoplc.com" or null. */
export function normalizeDomain(input: string | null | undefined): string | null {
  const raw = input?.trim().toLowerCase();
  if (!raw) return null;
  let host = raw;
  try {
    host = new URL(raw.includes("://") ? raw : `https://${raw}`).hostname;
  } catch {
    return null;
  }
  host = host.replace(/^www\./, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : null;
}

/** Sniff the real type from the bytes rather than trusting the upload's declared MIME type. */
export function detectLogoMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  const head = new TextDecoder().decode(bytes.subarray(0, 512)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return null;
}

export function logoExtension(mime: string): string | null {
  return MIME_EXTENSIONS[mime] ?? null;
}
