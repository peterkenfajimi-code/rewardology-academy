import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  CSP_REPORT_MAX_BODY,
  CSP_REPORT_RATE_LIMIT,
  CSP_REPORT_RATE_WINDOW_MS,
  parseCspReport,
} from "@/lib/security/cspReport";
import { clientIp, consumeSharedRateLimit } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const limited = await consumeSharedRateLimit(
    "csp-report",
    clientIp(req),
    CSP_REPORT_RATE_LIMIT,
    CSP_REPORT_RATE_WINDOW_MS
  );
  if (!limited.ok) {
    return new NextResponse(null, { status: 204 });
  }

  try {
    const raw = await req.text();
    if (!raw || raw.length > CSP_REPORT_MAX_BODY) {
      return new NextResponse(null, { status: 204 });
    }
    const summary = parseCspReport(JSON.parse(raw) as unknown);
    if (summary?.directive) {
      console.info("[csp-report]", summary.directive, summary.blockedHost);
      await record(summary, req.headers.get("user-agent") ?? "");
    }
  } catch {
    /* browsers retry on non-2xx; swallow malformed reports */
  }

  return new NextResponse(null, { status: 204 });
}

async function record(
  summary: { directive: string; blockedUri: string; documentUri: string; blockedHost: string },
  userAgent: string
) {
  if (!isSupabaseConfigured()) return;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    await Promise.all([
      supabase.rpc("record_csp_violation", {
        p_directive: summary.directive,
        p_blocked_host: summary.blockedHost,
      }),
      supabase.rpc("record_csp_violation_row", {
        p_directive: summary.directive,
        p_blocked_uri: summary.blockedUri,
        p_document_uri: summary.documentUri,
        p_user_agent: userAgent.slice(0, 300),
      }),
    ]);
  } catch {
    /* report-only: never fail the browser beacon */
  }
}
