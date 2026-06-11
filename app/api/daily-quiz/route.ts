import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import {
  DAILY_QUIZ_XP,
  isCorrectAnswer,
  questionForClient,
  questionForDate,
  todayDateKey,
} from "@/lib/daily-quiz/dailyQuizData";
import { computeStreak } from "@/lib/daily-quiz/streak";

export const runtime = "nodejs";

type CompletionRow = {
  quiz_date: string;
  question_id: string;
  selected_option: string;
  correct: boolean;
  xp_earned: number;
};

async function loadUserDailyState(userId: string) {
  const supabase = await createClient();
  const todayKey = todayDateKey();

  const { data: rows, error } = await supabase
    .from("daily_quiz_completions")
    .select("quiz_date, question_id, selected_option, correct, xp_earned")
    .eq("user_id", userId)
    .order("quiz_date", { ascending: false });

  if (error) throw error;

  const list = (rows as CompletionRow[] | null) ?? [];
  const dateKeys = list.map((r) => String(r.quiz_date).slice(0, 10));
  const todayRow = list.find((r) => String(r.quiz_date).slice(0, 10) === todayKey);

  const [{ data: quizRows }, { data: courseRows }, { data: articleRows }] = await Promise.all([
    supabase.from("quiz_centre_progress").select("best_xp").eq("user_id", userId),
    supabase.from("course_progress").select("xp").eq("user_id", userId),
    supabase.from("article_progress").select("xp").eq("user_id", userId),
  ]);

  const quizXp = (quizRows ?? []).reduce((s, r) => s + (r.best_xp ?? 0), 0);
  const courseXp = (courseRows ?? []).reduce((s, r) => s + (r.xp ?? 0), 0);
  const articleXp = (articleRows ?? []).reduce((s, r) => s + (r.xp ?? 0), 0);
  const dailyXp = list.reduce((s, r) => s + (r.xp_earned ?? 0), 0);

  return {
    authenticated: true as const,
    question: questionForClient(todayKey),
    today: todayRow
      ? {
          answered: true,
          correct: todayRow.correct,
          selectedKey: todayRow.selected_option,
          xpEarned: todayRow.xp_earned,
          explanation: questionForDate(todayKey).explanation ?? null,
          correctKey: questionForDate(todayKey).correctKey,
        }
      : { answered: false, correct: false, selectedKey: null, xpEarned: 0 },
    streak: computeStreak(dateKeys, todayKey),
    dailyXp,
    totalXp: quizXp + courseXp + dailyXp + articleXp,
    dailyCompletions: list.length,
  };
}

export async function GET() {
  const todayKey = todayDateKey();
  const question = questionForClient(todayKey);

  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      authenticated: false,
      question,
      today: { answered: false, correct: false, selectedKey: null, xpEarned: 0 },
      streak: 0,
      dailyXp: 0,
      totalXp: 0,
      dailyCompletions: 0,
    });
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        authenticated: false,
        question,
        today: { answered: false, correct: false, selectedKey: null, xpEarned: 0 },
        streak: 0,
        dailyXp: 0,
        totalXp: 0,
        dailyCompletions: 0,
      });
    }

    return NextResponse.json(await loadUserDailyState(user.id));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load daily quiz";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  let body: { selectedKey?: string; questionId?: string; dateKey?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const todayKey = todayDateKey();
  const dateKey = body.dateKey ?? todayKey;
  if (dateKey !== todayKey) {
    return NextResponse.json({ error: "Can only submit today's quiz" }, { status: 400 });
  }

  const selectedKey = body.selectedKey?.trim();
  const questionId = body.questionId?.trim();
  if (!selectedKey || !questionId) {
    return NextResponse.json({ error: "Missing answer" }, { status: 400 });
  }

  const correct = isCorrectAnswer(questionId, selectedKey, dateKey);
  const xpEarned = correct ? DAILY_QUIZ_XP : 0;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to save progress" }, { status: 401 });
    }

    const { error: rpcErr } = await supabase.rpc("record_daily_quiz_completion", {
      p_quiz_date: dateKey,
      p_question_id: questionId,
      p_selected_option: selectedKey,
      p_correct: correct,
      p_xp_earned: xpEarned,
    });

    if (rpcErr) throw rpcErr;

    return NextResponse.json(await loadUserDailyState(user.id));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
