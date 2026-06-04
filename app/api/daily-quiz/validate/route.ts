import { NextResponse } from "next/server";
import { isCorrectAnswer, questionForDate, todayDateKey } from "@/lib/daily-quiz/dailyQuizData";

export const runtime = "nodejs";

export async function POST(req: Request) {
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

  const q = questionForDate(dateKey);
  const correct = isCorrectAnswer(questionId, selectedKey, dateKey);

  return NextResponse.json({
    correct,
    correctKey: q.correctKey,
  });
}
