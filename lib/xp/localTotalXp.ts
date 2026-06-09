import { readLocalDaily } from "@/lib/daily-quiz/localProgress";
import { totalCourseXp, readLocalCourseXp } from "@/lib/courses/progress";
import { readLocalProgress, totalXpFromMap } from "@/lib/quizzes/progress";

/** Combined XP from quiz centre, courses, and daily quizzes (local device cache). */
export function readLocalTotalXp(): number {
  if (typeof window === "undefined") return 0;
  const quizXp = totalXpFromMap(readLocalProgress());
  const courseXp = totalCourseXp(readLocalCourseXp());
  const dailyXp = readLocalDaily()?.totalXpEarned ?? 0;
  return quizXp + courseXp + dailyXp;
}
