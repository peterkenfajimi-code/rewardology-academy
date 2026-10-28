import { NextResponse } from "next/server";
import { clientIp, consumeRateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const MAX_BODY = 8_192;

function hostOf(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  try {
    return new URL(value).host || value.slice(0, 120);
  } catch {
    return value.slice(0, 120);
  }
}

function summarize(body: unknown): { directive: string; blocked: string } | null {
  if (!body || typeof body !== "object") return null;

  const reportTo = body as {
    type?: string;
    body?: { effectiveDirective?: string; blockedURL?: string; violatedDirective?: string };
    "csp-report"?: {
      "violated-directive"?: string;
      "effective-directive"?: string;
      "blocked-uri"?: string;
    };
  };

  if (Array.isArray(body)) {
    const first = body[0] as typeof reportTo | undefined;
    return first ? summarize(first) : null;
  }

  const nested = reportTo.body;
  if (nested) {
    return {
      directive: String(nested.effectiveDirective || nested.violatedDirective || ""),
      blocked: hostOf(nested.blockedURL),
    };
  }

  const legacy = reportTo["csp-report"];
  if (legacy) {
    return {
      directive: String(legacy["effective-directive"] || legacy["violated-directive"] || ""),
      blocked: hostOf(legacy["blocked-uri"]),
    };
  }

  return null;
}

export async function POST(req: Request) {
  const limited = consumeRateLimit("csp-report", clientIp(req), 30, 60_000);
  if (!limited.ok) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const raw = await req.text();
    if (!raw || raw.length > MAX_BODY) {
      return new NextResponse(null, { status: 204 });
    }
    const summary = summarize(JSON.parse(raw) as unknown);
    if (summary?.directive) {
      console.info("[csp-report]", summary.directive, summary.blocked);
    }
  } catch {
    /* browsers retry on non-2xx; swallow malformed reports */
  }

  return new NextResponse(null, { status: 204 });
}
