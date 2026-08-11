import { COURSES, allLessons } from "@/lib/courses/courseData";

type ProgressRow = {
  lesson_id: string;
  xp: number;
  updated_at: string;
};

/** Max lesson updated_at when every lesson in the course has XP; null if incomplete. */
export function courseCompletionIssuedAt(
  courseId: number,
  rows: ProgressRow[] | null
): string | null {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;

  const byLesson = new Map((rows ?? []).map((r) => [r.lesson_id, r]));
  let maxAt: string | null = null;

  for (const { lesson } of allLessons(course)) {
    const row = byLesson.get(lesson.id);
    if (!row || row.xp <= 0) return null;
    if (!maxAt || row.updated_at > maxAt) maxAt = row.updated_at;
  }

  return maxAt;
}
