const DISMISS_KEY = "ra_testimonial_dismiss_until";
const QUIZ_FINISH_COUNT_KEY = "ra_quiz_finish_count";
const SUBMITTED_LOCAL_KEY = "ra_testimonial_submitted";
const DISMISS_DAYS = 21;

export function sourceKey(sourceType: string, sourceId: string): string {
  return `${sourceType}:${sourceId}`;
}

function readSubmittedLocal(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SUBMITTED_LOCAL_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

export function markSubmittedLocal(sourceType: string, sourceId: string): void {
  if (typeof window === "undefined") return;
  const set = readSubmittedLocal();
  set.add(sourceKey(sourceType, sourceId));
  localStorage.setItem(SUBMITTED_LOCAL_KEY, JSON.stringify([...set]));
}

export function isSubmittedLocal(sourceType: string, sourceId: string): boolean {
  return readSubmittedLocal().has(sourceKey(sourceType, sourceId));
}

export function dismissTestimonialPrompt(): void {
  if (typeof window === "undefined") return;
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  localStorage.setItem(DISMISS_KEY, String(until));
}

export function isTestimonialPromptDismissed(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const until = Number(raw);
  if (!Number.isFinite(until) || until <= Date.now()) {
    localStorage.removeItem(DISMISS_KEY);
    return false;
  }
  return true;
}

export function incrementQuizFinishCount(): number {
  if (typeof window === "undefined") return 1;
  const next = Number(localStorage.getItem(QUIZ_FINISH_COUNT_KEY) || "0") + 1;
  localStorage.setItem(QUIZ_FINISH_COUNT_KEY, String(next));
  return next;
}

export function isQuizTestimonialEligible(finishCount: number, scorePct: number): boolean {
  if (isTestimonialPromptDismissed()) return false;
  if (finishCount === 1) return true;
  if (scorePct === 100) return true;
  if (finishCount > 0 && finishCount % 3 === 0) return true;
  return false;
}
