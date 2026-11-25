import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { certificateVerifyUrl } from "@/lib/certificates/urls";
import type { IssueCertificatePayload } from "@/lib/certificates/types";
import {
  ignoreClientIssueScore,
  sanitizeRecipientName,
  verifiedCourseCertificate,
  verifiedDailyQuizCertificate,
  verifiedQuizCentreCertificate,
  type VerifiedCertificate,
} from "@/lib/certificates/verifyIssue";

const UNAUTH = NextResponse.json({ error: "Sign in required" }, { status: 401 });
const UNVERIFIED = NextResponse.json(
  { error: "Complete this before a certificate can be issued" },
  { status: 403 }
);

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

  const recipientName = sanitizeRecipientName(body.recipientName);
  if (!recipientName) {
    return NextResponse.json({ error: "Enter the name that should appear on the certificate" }, { status: 400 });
  }

  const certType = body.certType;
  const sourceId = String(body.sourceId ?? "").trim();
  if (!certType || !sourceId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  let verified: VerifiedCertificate | null = null;

  if (certType === "course") {
    const courseId = Number(sourceId);
    if (!Number.isFinite(courseId)) return UNVERIFIED;
    const { data: rows } = await supabase
      .from("course_progress")
      .select("lesson_id, xp, updated_at")
      .eq("user_id", user.id)
      .eq("course_id", courseId);
    verified = verifiedCourseCertificate(sourceId, rows, recipientName);
  } else if (certType === "quiz_centre") {
    const quizId = Number(sourceId);
    if (!Number.isFinite(quizId)) return UNVERIFIED;
    const { data: row } = await supabase
      .from("quiz_centre_progress")
      .select("best_score, best_total, best_xp, updated_at")
      .eq("user_id", user.id)
      .eq("quiz_id", quizId)
      .maybeSingle();
    verified = verifiedQuizCentreCertificate(sourceId, row, recipientName);
  } else if (certType === "quiz") {
    const { data: row } = await supabase
      .from("daily_quiz_completions")
      .select("correct, xp_earned, created_at")
      .eq("user_id", user.id)
      .eq("quiz_date", sourceId)
      .maybeSingle();
    verified = verifiedDailyQuizCertificate(sourceId, row, recipientName);
  } else {
    return NextResponse.json({ error: "Invalid certificate type" }, { status: 400 });
  }

  if (!verified) return UNVERIFIED;

  const issued = ignoreClientIssueScore(verified, body);

  const { data: id, error } = await supabase.rpc("issue_certificate", {
    p_cert_type: issued.certType,
    p_source_id: issued.sourceId,
    p_recipient_name: issued.recipientName,
    p_credential_name: issued.credentialName,
    p_credential_detail: issued.credentialDetail,
    p_score_pct: issued.scorePct,
    p_xp_earned: issued.xpEarned,
    p_issued_at: issued.issuedAt,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const certId = String(id);

  const { data: cert } = await supabase
    .from("issued_certificates")
    .select("issued_at")
    .eq("id", certId)
    .maybeSingle();

  return NextResponse.json({
    id: certId,
    verifyUrl: certificateVerifyUrl(certId),
    issuedAt: cert?.issued_at ?? verified.issuedAt ?? undefined,
  });
}
