import { localDictionaryXpTotal } from "@/lib/dictionary/progress";
import { readLocalDaily } from "@/lib/daily-quiz/localProgress";
import { localArticleXpTotal } from "@/lib/articles/progress";
import { totalCourseXp, readLocalCourseXp } from "@/lib/courses/progress";
import { readLocalProgress, totalXpFromMap } from "@/lib/quizzes/progress";

/** Combined XP from quizzes, courses, daily quizzes, and articles (local device cache). */
export function readLocalTotalXp(): number {
  if (typeof window === "undefined") return 0;
  const quizXp = totalXpFromMap(readLocalProgress());
  const courseXp = totalCourseXp(readLocalCourseXp());
  const dailyXp = readLocalDaily()?.totalXpEarned ?? 0;
  const articleXp = localArticleXpTotal();
  const dictionaryXp = localDictionaryXpTotal();
  return quizXp + courseXp + dailyXp + articleXp + dictionaryXp;
}
