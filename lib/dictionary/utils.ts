export function slugifyTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function termCardId(term: string): string {
  return `tc-${slugifyTerm(term)}`;
}

export function previewText(text: string | undefined, max = 155): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
}

/** Stable daily index based on the viewer's local calendar date. */
export function dictionaryTermIndexForDate(date: Date, termCount: number): number {
  if (termCount <= 0) return 0;
  const localCalendarDay = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
  return localCalendarDay % termCount;
}

export function lessonHref(lessonId: string): string {
  const courseId = lessonId.split("-")[0];
  return `/courses?course=${courseId}&lesson=${encodeURIComponent(lessonId)}`;
}

export function termPlainText(t: {
  term: string;
  definition: string;
  note?: string | null;
  example?: string | null;
}): string {
  return [
    t.term,
    t.definition,
    t.note ? `Practitioner note: ${t.note}` : "",
    t.example ? `Worked example: ${t.example}` : "",
  ]
    .filter(Boolean)
    .join(". ");
}
