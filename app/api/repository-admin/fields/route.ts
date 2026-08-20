import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { loadFieldRegistry } from "@/lib/repository/field-registry";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  const supabase = createRepositoryAdminClient();
  try {
    const fields = await loadFieldRegistry(supabase);
    return NextResponse.json({ fields });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not load field registry" },
      { status: 500 }
    );
  }
}
