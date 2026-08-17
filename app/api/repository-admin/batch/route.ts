import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isAnthropicConfigured, isRepositorySupabaseConfigured } from "@/lib/env";
import {
  createBatchRunRecord,
  runBenefitsRepositoryBatch,
  updateBatchRunRecord,
  type BatchConfig,
} from "@/lib/repository/batch-runner";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

export const runtime = "nodejs";
export const maxDuration = 300;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const activeRuns = new Set<string>();

export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  const runId = req.nextUrl.searchParams.get("runId");
  const supabase = createRepositoryAdminClient();

  if (runId) {
    const { data, error } = await supabase.from("batch_runs").select("*").eq("run_id", runId).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Run not found" }, { status: 404 });
    return NextResponse.json({ run: data });
  }

  const { data, error } = await supabase
    .from("batch_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(5);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ runs: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }

  let body: BatchConfig;
  try {
    body = (await req.json()) as BatchConfig;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createRepositoryAdminClient();
  let runId: string;

  try {
    runId = await createBatchRunRecord(supabase, body);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not start batch run" },
      { status: 500 }
    );
  }

  if (activeRuns.has(runId)) {
    return NextResponse.json({ runId, status: "running" });
  }

  activeRuns.add(runId);

  void runBenefitsRepositoryBatch(supabase, body, async (progress, log) => {
    await updateBatchRunRecord(supabase, runId, { progress, log, status: "running" });
  })
    .then(async (result) => {
      await updateBatchRunRecord(supabase, runId, {
        status: "completed",
        progress: result.progress,
        log: result.log,
        finished_at: new Date().toISOString(),
      });
    })
    .catch(async (e) => {
      await updateBatchRunRecord(supabase, runId, {
        status: "failed",
        log: e instanceof Error ? e.message : "Batch failed",
        finished_at: new Date().toISOString(),
      });
    })
    .finally(() => {
      activeRuns.delete(runId);
    });

  return NextResponse.json({
    runId,
    status: "running",
    message:
      "Batch started. Poll GET /api/repository-admin/batch?runId=… for progress. For full NGX/FMDQ/NASD runs use npm run run:benefits-repository-batch locally.",
  });
}
