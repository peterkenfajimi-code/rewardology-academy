const MAX_PDF_BYTES = 20 * 1024 * 1024;
const MAX_TEXT_CHARS = 120_000;

export type FetchedSource =
  | { kind: "text"; text: string }
  | { kind: "pdf"; buffer: Buffer; pageCount?: number };

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchSourceDocument(url: string): Promise<FetchedSource> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Source URL is not valid");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Source URL must be http or https");
  }

  const res = await fetch(parsed.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      Accept: "text/html,application/pdf,*/*",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`Could not fetch source URL (HTTP ${res.status})`);
  }

  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();
  const buffer = Buffer.from(await res.arrayBuffer());

  if (
    contentType.includes("html") &&
    buffer.toString("utf-8", 0, Math.min(buffer.length, 2000)).includes("sucuri_cloudproxy")
  ) {
    throw new Error(
      "Source URL is behind bot protection (Sucuri) — download the PDF in a browser, save to data/gcb-downloads/, or paste the benefits section in the admin tool."
    );
  }
  const looksLikePdf =
    contentType.includes("pdf") ||
    parsed.pathname.toLowerCase().endsWith(".pdf") ||
    buffer.subarray(0, 4).toString() === "%PDF";

  if (looksLikePdf) {
    if (buffer.length > MAX_PDF_BYTES) {
      throw new Error(
        "PDF is too large to download — open the report, copy the benefits section, and paste it below."
      );
    }
    return { kind: "pdf", buffer };
  }

  const text = stripHtml(buffer.toString("utf-8"));
  if (text.length < 80) {
    throw new Error(
      "Could not read useful text from that URL — paste an excerpt from the report in the box below."
    );
  }

  return { kind: "text", text: text.slice(0, MAX_TEXT_CHARS) };
}
