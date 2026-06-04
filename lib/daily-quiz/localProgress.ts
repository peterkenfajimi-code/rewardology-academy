export const DAILY_QUIZ_STORAGE_KEY = "ra_daily_quiz";

export type LocalDailyState = {
  dateKey: string;
  questionId: string;
  selectedKey: string;
  correct: boolean;
  xpEarned: number;
  history: string[];
  totalXpEarned: number;
};

export function readLocalDaily(): LocalDailyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_QUIZ_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalDailyState) : null;
  } catch {
    return null;
  }
}

export function writeLocalDaily(state: LocalDailyState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DAILY_QUIZ_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
