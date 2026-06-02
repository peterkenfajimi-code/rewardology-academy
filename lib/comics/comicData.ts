export type ComicIssue = {
  number: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  image?: string;
  available: boolean;
  accent: string;
  nextIssue?: string;
};

export const COMIC_SERIES = {
  title: "The Total Rewards Effect",
  slug: "total-rewards-effect",
  eyebrow: "Comic Series",
  tagline:
    "Stories, workplaces, real impact. Exploring the people side of total rewards.",
  coverImage: "/assets/comics/series-cover.png",
  footerTagline: "Better Conversations. Better Workplaces. Better Rewards.",
  nextTeaser: "The Future of Work Is Human!",
};

export const COMIC_ISSUES: ComicIssue[] = [
  {
    number: 1,
    slug: "issue-1",
    title: "The Total Rewards Effect",
    tagline: "Two companies. Same industry. Same salaries. Completely different stories.",
    description:
      "Discover how total rewards shapes engagement, performance, and retention.",
    image: "/assets/comics/issue-1.png",
    available: true,
    accent: "#C8963E",
    nextIssue: "The Retention Conversation",
  },
  {
    number: 2,
    slug: "issue-2",
    title: "The Retention Conversation",
    tagline:
      "Sometimes people don't leave because of the job. They leave because of how they feel.",
    description:
      "A manager's guide to meaningful conversations that build loyalty.",
    image: "/assets/comics/issue-2.png",
    available: true,
    accent: "#2E7D8C",
    nextIssue: "The Pay Transparency Meeting",
  },
  {
    number: 3,
    slug: "issue-3",
    title: "The Pay Transparency Meeting",
    tagline:
      "How pay transparency done right creates fairness, trust, and a stronger culture.",
    description:
      "Practical steps to communicate compensation with confidence.",
    image: "/assets/comics/issue-3.png",
    available: true,
    accent: "#0C6B65",
    nextIssue: "Recognition That Sticks",
  },
  {
    number: 4,
    slug: "issue-4",
    title: "Recognition That Sticks",
    tagline: "Recognition isn't extra. It's essential.",
    description:
      "How meaningful recognition drives engagement, performance, and culture.",
    image: "/assets/comics/issue-4.png",
    available: true,
    accent: "#6B4C9A",
    nextIssue: "Purpose, Performance, and Pay",
  },
  {
    number: 5,
    slug: "issue-5",
    title: "Purpose, Performance, and Pay",
    tagline: "When purpose and performance align, everyone wins—including you.",
    description:
      "Aligning growth, impact, and total rewards for lasting success.",
    image: "/assets/comics/issue-5.png",
    available: true,
    accent: "#B84B4B",
    nextIssue: "The Future of Work Is Human!",
  },
];

export function getComicBySlug(slug: string): ComicIssue | undefined {
  return COMIC_ISSUES.find((issue) => issue.slug === slug);
}

export function getAdjacentIssues(slug: string): {
  prev?: ComicIssue;
  next?: ComicIssue;
} {
  const idx = COMIC_ISSUES.findIndex((issue) => issue.slug === slug);
  if (idx === -1) return {};
  return {
    prev: idx > 0 ? COMIC_ISSUES[idx - 1] : undefined,
    next: idx < COMIC_ISSUES.length - 1 ? COMIC_ISSUES[idx + 1] : undefined,
  };
}
