import type { CourseLesson } from "@/lib/courses/courseData";

/** Strip HTML tags and decode common entities for TTS output. */
function stripHtml(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Plain text from lesson blocks for read-aloud. */
export function lessonPlainText(lesson: CourseLesson): string {
  const parts: string[] = [lesson.title];
  if (lesson.objectives?.length) {
    parts.push("Learning objectives.", ...lesson.objectives);
  }
  for (const b of lesson.body ?? []) {
    if (b.t === "h" && typeof b.v === "string") parts.push(stripHtml(b.v));
    else if (b.t === "p" && typeof b.v === "string") parts.push(stripHtml(b.v));
    else if (b.t === "intro" && typeof b.v === "string") parts.push(stripHtml(b.v));
    else if (b.t === "box" && typeof b.v === "string") {
      if (b.label) parts.push(b.label);
      parts.push(stripHtml(b.v));
    } else if (b.t === "scenario" && typeof b.v === "string") {
      if (b.title) parts.push(b.title);
      if (b.org) parts.push(b.org);
      parts.push(stripHtml(b.v));
    } else if (b.t === "takeaways") {
      const list = b.items ?? (Array.isArray(b.v) ? b.v : []);
      if (list.length) parts.push("Key takeaways.", ...list.map(stripHtml));
    } else if (b.t === "quiz_intro" && typeof b.v === "string") {
      parts.push(stripHtml(b.v));
    } else if (b.t === "reveal" && typeof b.v === "string") {
      if (b.label) parts.push(stripHtml(b.label));
      parts.push(stripHtml(b.v));
    }
  }
  if (lesson.quiz) {
    parts.push(lesson.quiz.q);
  }
  return parts.filter(Boolean).join(". ");
}
