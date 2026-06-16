export type DashboardBadge = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  trigger: "xp" | "action";
  threshold?: number;
  key?: keyof BadgeActionFlags;
};

export type BadgeActionFlags = {
  course_complete: boolean;
  articles_10: boolean;
  quiz_perfect: boolean;
  dict_50: boolean;
};

export const DASHBOARD_BADGES: DashboardBadge[] = [
  { id: "first_steps", name: "First Steps", icon: "🌱", desc: "Reach 300 XP", trigger: "xp", threshold: 300 },
  {
    id: "course_champion",
    name: "Course Champion",
    icon: "🎓",
    desc: "Complete any course",
    trigger: "action",
    key: "course_complete",
  },
  {
    id: "article_addict",
    name: "Article Addict",
    icon: "📰",
    desc: "Read 10 articles",
    trigger: "action",
    key: "articles_10",
  },
  {
    id: "quiz_ace",
    name: "Quiz Ace",
    icon: "⚡",
    desc: "Score 100% on a quiz",
    trigger: "action",
    key: "quiz_perfect",
  },
  {
    id: "dict_deep_dive",
    name: "Dictionary Deep Dive",
    icon: "📖",
    desc: "Explore 50 terms",
    trigger: "action",
    key: "dict_50",
  },
  { id: "xp_hunter", name: "XP Hunter", icon: "🏹", desc: "Reach 4,500 XP", trigger: "xp", threshold: 4500 },
  { id: "platform_master", name: "Platform Master", icon: "🏆", desc: "Reach 8,500 XP", trigger: "xp", threshold: 8500 },
  { id: "grand_master", name: "Grand Master", icon: "👑", desc: "Reach 12,000 XP", trigger: "xp", threshold: 12000 },
];

export function isBadgeEarned(
  badge: DashboardBadge,
  totalXp: number,
  actions: BadgeActionFlags
): boolean {
  if (badge.trigger === "xp") return totalXp >= (badge.threshold ?? 0);
  if (!badge.key) return false;
  return actions[badge.key];
}

export function evaluateBadges(totalXp: number, actions: BadgeActionFlags) {
  return DASHBOARD_BADGES.map((badge) => ({
    ...badge,
    earned: isBadgeEarned(badge, totalXp, actions),
  }));
}
