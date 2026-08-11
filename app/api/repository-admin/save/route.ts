import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { saveEntriesWithReconciliation } from "@/lib/repository/reconciliation";
import type { ExtractedEntry, SourceRecord, SourceType } from "@/lib/repository/types";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  let body: {
    companyId?: string;
    source?: Omit<SourceRecord, "company_id"> & { source_type: SourceType };
    entries?: ExtractedEntry[];
    publish?: boolean;
    actor?: string;
  };

  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.companyId || !body.source?.source_type) {
    return NextResponse.json({ error: "companyId and source are required" }, { status: 400 });
  }

  if (!body.entries?.length) {
    return NextResponse.json({ error: "At least one entry is required" }, { status: 400 });
  }

  if (!body.source.source_url?.trim() && !body.source.source_title?.trim()) {
    return NextResponse.json(
      { error: "Source URL or title is required before saving" },
      { status: 400 }
    );
  }

  const supabase = createRepositoryAdminClient();
  const actor = body.actor?.trim() || "repository-admin";

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert({
      company_id: body.companyId,
      source_type: body.source.source_type,
      source_url: body.source.source_url?.trim() || null,
      source_title: body.source.source_title?.trim() || null,
      publication_date: body.source.publication_date || null,
      date_accessed: body.source.date_accessed || new Date().toISOString().slice(0, 10),
      country: body.source.country || null,
    })
    .select("source_id")
    .single();

  if (sourceError || !source) {
    return NextResponse.json({ error: sourceError?.message ?? "Could not save source" }, { status: 500 });
  }

  try {
    const results = await saveEntriesWithReconciliation(supabase, {
      companyId: body.companyId,
      sourceId: source.source_id,
      sourceType: body.source.source_type,
      actor,
      entries: body.entries.map((e) => ({ ...e, publish: body.publish })),
    });

    await supabase
      .from("companies")
      .update({ last_reviewed_at: new Date().toISOString() })
      .eq("company_id", body.companyId);

    return NextResponse.json({ sourceId: source.source_id, results });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}
