export const XP_LEVELS = [
  { name: "HR Intern", min: 0 },
  { name: "Reward Analyst", min: 150 },
  { name: "Compensation Specialist", min: 450 },
  { name: "Total Rewards Manager", min: 750 },
  { name: "Global Rewards Director", min: 1050 },
  { name: "Chief People Officer", min: 1350 },
] as const;

export function levelFor(xp: number) {
  let current = XP_LEVELS[0];
  let next: (typeof XP_LEVELS)[number] | null = null;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].min) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] ?? null;
    }
  }
  return { current, next };
}
