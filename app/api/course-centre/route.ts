import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { findLesson } from "@/lib/courses/courseData";
import { lessonKey, type LessonXpMap } from "@/lib/courses/progress";

type ProgressRow = {
  course_id: number;
  lesson_id: string;
  xp: number;
  updated_at: string;
};

function rowsToMap(rows: ProgressRow[] | null): LessonXpMap {
  const map: LessonXpMap = {};
  for (const r of rows ?? []) {
    map[lessonKey(r.course_id, r.lesson_id)] = r.xp;
  }
  return map;
}

const UNAUTH = NextResponse.json({ authenticated: false, lxp: {} });

// ── Load the signed-in user's course XP (falls back to unauthenticated) ──
export async function GET() {
  if (!isSupabaseConfigured()) return UNAUTH;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { data, error } = await supabase
      .from("course_progress")
      .select("course_id, lesson_id, xp, updated_at")
      .eq("user_id", user.id);

    if (error) return UNAUTH;

    return NextResponse.json({
      authenticated: true,
      lxp: rowsToMap(data as ProgressRow[]),
    });
  } catch {
    return UNAUTH;
  }
}

type SavePayload = {
  courseId: number;
  lessonId: string;
  xp: number;
};

// ── Record lesson XP for the signed-in user, return refreshed map ──
export async function POST(req: Request) {
  if (!isSupabaseConfigured()) return UNAUTH;

  let body: SavePayload;
  try {
    body = (await req.json()) as SavePayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const found = findLesson(Number(body?.courseId), String(body?.lessonId));
  if (!found) {
    return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  }

  // Cap XP at the lesson's defined maximum so a client can't inflate it.
  const maxXp = found.lesson.xp;
  const xp = Math.max(0, Math.min(Number(body.xp) || 0, maxXp));

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return UNAUTH;

    const { error: rpcError } = await supabase.rpc("record_course_lesson", {
      p_course_id: found.course.id,
      p_lesson_id: found.lesson.id,
      p_xp: xp,
    });
    if (rpcError) {
      return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
    }

    const { data } = await supabase
      .from("course_progress")
      .select("course_id, lesson_id, xp, updated_at")
      .eq("user_id", user.id);

    return NextResponse.json({
      authenticated: true,
      lxp: rowsToMap(data as ProgressRow[]),
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
