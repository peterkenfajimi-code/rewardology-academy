/** Sum XP from all platform sources (server-side aggregates). */
export function sumPlatformXp(parts: {
  quizXp?: number;
  courseXp?: number;
  dailyXp?: number;
  articleXp?: number;
  dictionaryXp?: number;
  comicsXp?: number;
}): number {
  return (
    (parts.quizXp ?? 0) +
    (parts.courseXp ?? 0) +
    (parts.dailyXp ?? 0) +
    (parts.articleXp ?? 0) +
    (parts.dictionaryXp ?? 0) +
    (parts.comicsXp ?? 0)
  );
}
