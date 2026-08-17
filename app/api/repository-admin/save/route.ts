import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { saveSourceAndEntries } from "@/lib/repository/save-source";
import type { ExtractedEntry, SourceRecord, SourceType } from "@/lib/repository/types";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

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

  try {
    const saved = await saveSourceAndEntries(supabase, {
      companyId: body.companyId,
      source: body.source,
      entries: body.entries,
      publish: body.publish,
      actor,
    });

    return NextResponse.json({
      sourceId: saved.sourceId,
      skipped: saved.skipped,
      results: saved.results,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 500 }
    );
  }
}

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
