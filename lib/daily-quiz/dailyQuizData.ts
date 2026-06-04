import pool from "./dailyQuizPool.json";

export const DAILY_QUIZ_XP = 15;

export type DailyQuizOption = { key: string; label: string };

export type DailyQuizQuestion = {
  id: string;
  label: string;
  title: string;
  question: string;
  options: DailyQuizOption[];
  correctKey: string;
};

/** Rotating pool — 365 daily-only questions (seeds + expanded bank; not from Quiz Centre). */
export const DAILY_QUIZ_POOL: DailyQuizQuestion[] = pool as DailyQuizQuestion[];

export function todayDateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function questionForDate(dateKey: string): DailyQuizQuestion {
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }
  return DAILY_QUIZ_POOL[hash % DAILY_QUIZ_POOL.length];
}

export function questionForClient(dateKey: string) {
  const q = questionForDate(dateKey);
  return {
    id: q.id,
    label: q.label,
    title: q.title,
    question: q.question,
    options: q.options,
    dateKey,
    xpReward: DAILY_QUIZ_XP,
  };
}

export function isCorrectAnswer(questionId: string, selectedKey: string, dateKey: string): boolean {
  const q = questionForDate(dateKey);
  if (q.id !== questionId) return false;
  return q.correctKey === selectedKey;
}
