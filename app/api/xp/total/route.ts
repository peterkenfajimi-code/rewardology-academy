import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ authenticated: false, total: 0 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, total: 0 });
  }

  const [quizRes, courseRes, dailyRes, articleRes, dictRes, comicsRes] =
    await Promise.all([
      supabase
        .from("quiz_centre_progress")
        .select("best_xp")
        .eq("user_id", user.id),
      supabase
        .from("course_progress")
        .select("xp")
        .eq("user_id", user.id),
      supabase
        .from("daily_quiz_completions")
        .select("xp_earned")
        .eq("user_id", user.id),
      supabase
        .from("article_progress")
        .select("xp")
        .eq("user_id", user.id),
      supabase
        .from("dictionary_progress")
        .select("xp")
        .eq("user_id", user.id),
      supabase
        .from("comics_progress")
        .select("xp")
        .eq("user_id", user.id),
    ]);

  const sum = (rows: { xp?: number; best_xp?: number; xp_earned?: number }[] | null, key: string) =>
    (rows ?? []).reduce((s, r) => s + ((r as Record<string, number>)[key] ?? 0), 0);

  const total =
    sum(quizRes.data, "best_xp") +
    sum(courseRes.data, "xp") +
    sum(dailyRes.data, "xp_earned") +
    sum(articleRes.data, "xp") +
    sum(dictRes.data, "xp") +
    sum(comicsRes.data, "xp");

  return NextResponse.json({ authenticated: true, total });
}
