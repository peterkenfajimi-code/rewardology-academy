export const CSP_REPORT_MAX_BODY = 8_192;
export const CSP_REPORT_RATE_LIMIT = 30;
export const CSP_REPORT_RATE_WINDOW_MS = 60_000;

/** Strip query and fragment so tokens never land in CSP logs. */
export function stripUri(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  try {
    const url = new URL(value);
    url.search = "";
    url.hash = "";
    return url.toString().slice(0, 500);
  } catch {
    return value.split(/[?#]/)[0]?.slice(0, 500) ?? "";
  }
}

export type CspReportSummary = {
  directive: string;
  blockedUri: string;
  documentUri: string;
  blockedHost: string;
};

function hostOf(value: string): string {
  if (!value) return "";
  try {
    return new URL(value).host || value.slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

export function parseCspReport(body: unknown): CspReportSummary | null {
  if (!body || typeof body !== "object") return null;

  if (Array.isArray(body)) {
    const first = body[0];
    return first ? parseCspReport(first) : null;
  }

  const reportTo = body as {
    type?: string;
    body?: {
      effectiveDirective?: string;
      violatedDirective?: string;
      blockedURL?: string;
      documentURL?: string;
    };
    "csp-report"?: {
      "violated-directive"?: string;
      "effective-directive"?: string;
      "blocked-uri"?: string;
      "document-uri"?: string;
    };
  };

  const nested = reportTo.body;
  if (nested) {
    const blockedUri = stripUri(nested.blockedURL);
    const documentUri = stripUri(nested.documentURL);
    return {
      directive: String(nested.effectiveDirective || nested.violatedDirective || "").slice(0, 200),
      blockedUri,
      documentUri,
      blockedHost: hostOf(blockedUri),
    };
  }

  const legacy = reportTo["csp-report"];
  if (legacy) {
    const blockedUri = stripUri(legacy["blocked-uri"]);
    const documentUri = stripUri(legacy["document-uri"]);
    return {
      directive: String(legacy["effective-directive"] || legacy["violated-directive"] || "").slice(0, 200),
      blockedUri,
      documentUri,
      blockedHost: hostOf(blockedUri),
    };
  }

  return null;
}
