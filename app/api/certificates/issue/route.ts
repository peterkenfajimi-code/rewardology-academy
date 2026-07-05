import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { certificateVerifyUrl } from "@/lib/certificates/urls";
import type { IssueCertificatePayload } from "@/lib/certificates/types";

const UNAUTH = NextResponse.json({ error: "Sign in required" }, { status: 401 });

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return UNAUTH;

  let body: IssueCertificatePayload;
  try {
    body = (await request.json()) as IssueCertificatePayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { certType, sourceId, recipientName, credentialName, credentialDetail, scorePct, xpEarned } =
    body;

  if (!certType || !sourceId || !recipientName?.trim() || !credentialName?.trim()) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!["course", "quiz_centre", "quiz"].includes(certType)) {
    return NextResponse.json({ error: "Invalid certificate type" }, { status: 400 });
  }

  const { data: id, error } = await supabase.rpc("issue_certificate", {
    p_cert_type: certType,
    p_source_id: String(sourceId),
    p_recipient_name: recipientName.trim(),
    p_credential_name: credentialName.trim(),
    p_credential_detail: credentialDetail?.trim() || null,
    p_score_pct: typeof scorePct === "number" ? scorePct : null,
    p_xp_earned: typeof xpEarned === "number" ? xpEarned : null,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const certId = String(id);
  return NextResponse.json({
    id: certId,
    verifyUrl: certificateVerifyUrl(certId),
  });
}
