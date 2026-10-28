import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { gradeQuizCentreAttempt } from "@/lib/quizzes/gradeQuizCentre";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import type { ProgressMap } from "@/lib/quizzes/progress";

type ProgressRow = {
  quiz_id: number;
  best_score: number;
  best_total: number;
  best_xp: number;
  updated_at: string;
};

function rowsToMap(rows: ProgressRow[] | null): ProgressMap {
  const map: ProgressMap = {};
  for (const r of rows ?? []) {
    map[r.quiz_id] = {
      score: r.best_score,
      total: r.best_total,
      xp: r.best_xp,
      date: r.updated_at,
    };
  }
  return map;
}

const UNAUTH = NextResponse.json({ authenticated: false, progress: {} });

// ── Load the signed-in user's progress (falls back to unauthenticated) ──
export async function GET() {
  if (!isSupabaseConfigured()) return UNAUTH;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { data, error } = await supabase
      .from("quiz_centre_progress")
      .select("quiz_id, best_score, best_total, best_xp, updated_at")
      .eq("user_id", user.id);

    if (error) return UNAUTH;

    return NextResponse.json({
      authenticated: true,
      progress: rowsToMap(data as ProgressRow[]),
    });
  } catch {
    return UNAUTH;
  }
}

type SavePayload = {
  quizId: number;
  answers: number[];
};

// ── Record an attempt for the signed-in user, return refreshed progress ──
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return UNAUTH;

  let body: SavePayload;
  try {
    body = (await req.json()) as SavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const quiz = QUIZ_CENTRE.find((q) => q.id === body?.quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Unknown quiz" }, { status: 404 });
  }

  const graded = gradeQuizCentreAttempt(quiz, body.answers);
  if (!graded) {
    return NextResponse.json({ error: "Submit every answer to save progress" }, { status: 400 });
  }
  const { score, total, xp } = graded;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { error: rpcError } = await supabase.rpc("record_quiz_centre_attempt", {
      p_quiz_id: quiz.id,
      p_score: score,
      p_total: total,
      p_xp: xp,
    });
    if (rpcError) {
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const { data } = await supabase
      .from("quiz_centre_progress")
      .select("quiz_id, best_score, best_total, best_xp, updated_at")
      .eq("user_id", user.id);

    return NextResponse.json({
      authenticated: true,
      progress: rowsToMap(data as ProgressRow[]),
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
