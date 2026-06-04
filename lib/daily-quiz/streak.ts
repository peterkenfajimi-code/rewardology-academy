/** Count consecutive calendar days (UTC) with a completion, ending today or yesterday. */
export function computeStreak(completedDateKeys: string[], todayKey: string): number {
  const set = new Set(completedDateKeys);
  if (set.size === 0) return 0;

  let streak = 0;
  let cursor = todayKey;

  if (!set.has(cursor)) {
    const yesterday = addDays(cursor, -1);
    if (!set.has(yesterday)) return 0;
    cursor = yesterday;
  }

  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function addDays(dateKey: string, delta: number): string {
  const d = new Date(`${dateKey}T12:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}
