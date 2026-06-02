export type QuizResult = {
  score: number;
  total: number;
  xp: number;
  date: string;
};

export type ProgressMap = Record<number, QuizResult>;

export const QUIZ_PROGRESS_STORAGE_KEY = "ra_completed";
export const QUIZ_XP_STORAGE_KEY = "ra_xp";

/** Total XP = sum of the best XP earned across all completed quizzes. */
export function totalXpFromMap(map: ProgressMap): number {
  return Object.values(map).reduce((sum, r) => sum + (r?.xp ?? 0), 0);
}

/**
 * Merge a fresh attempt into a progress map, keeping the higher-XP result
 * for that quiz (so retries never lower your standing).
 */
export function mergeResult(
  map: ProgressMap,
  quizId: number,
  result: QuizResult
): ProgressMap {
  const existing = map[quizId];
  const keep = existing && existing.xp > result.xp ? existing : result;
  return { ...map, [quizId]: keep };
}

export function readLocalProgress(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export function writeLocalProgress(map: ProgressMap): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(map));
    localStorage.setItem(QUIZ_XP_STORAGE_KEY, String(totalXpFromMap(map)));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
