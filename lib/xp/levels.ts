export const XP_LEVELS = [
  { name: "HR Intern", min: 0, desc: "Your Total Rewards journey starts here." },
  { name: "Reward Coordinator", min: 300, desc: "Building your foundation in Total Rewards." },
  { name: "Reward Analyst", min: 800, desc: "Developing analytical depth in compensation and benefits." },
  { name: "Compensation Specialist", min: 1600, desc: "Applying specialist expertise across reward frameworks." },
  { name: "Senior Reward Specialist", min: 2800, desc: "Demonstrating deep, cross-functional rewards mastery." },
  { name: "Total Rewards Manager", min: 4500, desc: "Leading with strategic Total Rewards knowledge." },
  { name: "Head of Reward", min: 6500, desc: "Commanding advanced practice across all reward disciplines." },
  { name: "Global Rewards Director", min: 8500, desc: "Operating at the highest levels of global reward strategy." },
  { name: "Chief Rewards Officer", min: 12000, desc: "The pinnacle of Total Rewards mastery." },
] as const;

export type XpLevel = (typeof XP_LEVELS)[number];

export function levelFor(xp: number) {
  let current: XpLevel = XP_LEVELS[0];
  let next: XpLevel | null = null;
  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (xp >= XP_LEVELS[i].min) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] ?? null;
    }
  }
  return { current, next };
}

export function rankProgress(xp: number) {
  const { current, next } = levelFor(xp);
  if (!next) return 1;
  return Math.min((xp - current.min) / (next.min - current.min), 1);
}

export const PINNACLE_RANK_XP = XP_LEVELS[XP_LEVELS.length - 1].min;
