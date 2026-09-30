import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notConfigured() {
  return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
}

/** Unreviewed unmapped findings, oldest first. */
export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) return notConfigured();

  const supabase = createRepositoryAdminClient();
  const { data, error } = await supabase
    .from("unmapped_findings")
    .select(
      "finding_id, raw_excerpt, suggested_category, suggested_field, ai_notes, created_at, companies ( name ), sources ( source_title, source_url, source_type )"
    )
    .is("reviewed_at", null)
    .order("created_at", { ascending: true })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ findings: data ?? [] });
}

/** Mark one finding reviewed: { finding_id }. */
export async function PATCH(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) return notConfigured();

  const body = (await req.json().catch(() => ({}))) as { finding_id?: string };
  if (!body.finding_id) {
    return NextResponse.json({ error: "finding_id is required" }, { status: 400 });
  }

  const supabase = createRepositoryAdminClient();
  const { data, error } = await supabase
    .from("unmapped_findings")
    .update({ reviewed_at: new Date().toISOString() })
    .eq("finding_id", body.finding_id)
    .is("reviewed_at", null)
    .select("finding_id")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Finding not found or already reviewed" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
