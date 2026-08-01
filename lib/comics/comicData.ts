export type ComicIssue = {
  number: number;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  coverImage: string;
  pages: string[];
  available: boolean;
  accent: string;
  nextIssue?: string;
};

const ISSUE_1_PAGES = [
  "/assets/comics/issue-1/01-cover.png",
  "/assets/comics/issue-1/02-inside-cover.png",
  "/assets/comics/issue-1/03-meet-the-characters.png",
  "/assets/comics/issue-1/04-the-welcome.png",
  "/assets/comics/issue-1/05-beyond-the-welcome-pack.png",
  "/assets/comics/issue-1/06-the-tour.png",
  "/assets/comics/issue-1/07-the-reflection.png",
  "/assets/comics/issue-1/08-the-real-test.png",
  "/assets/comics/issue-1/09-hidden-in-plain-sight-corrected.png",
  "/assets/comics/issue-1/10-what-employees-value-corrected.png",
  "/assets/comics/issue-1/11-the-rewardology-lens.png",
  "/assets/comics/issue-1/12-jordan-connects-the-dots.png",
  "/assets/comics/issue-1/13-key-takeaways-and-issue-2-preview.png",
] as const;

export const COMIC_SERIES = {
  title: "The Total Rewards Effect",
  slug: "total-rewards-effect",
  eyebrow: "Comic Series",
  tagline:
    "Workplace stories with real impact — exploring the people side of total rewards.",
  coverImage: ISSUE_1_PAGES[0],
  footerTagline: "Better Conversations. Better Workplaces. Better Rewards.",
  nextTeaser: "Issue 2 — Coming Soon",
};

export const COMIC_ISSUES: ComicIssue[] = [
  {
    number: 1,
    slug: "issue-1",
    title: "Hidden in Plain Sight",
    tagline: "It's not just what we pay. It's why it matters.",
    description:
      "Jordan's first week at Veridian Global reveals how total rewards shapes culture, trust, and retention — often in ways employees feel before they can name.",
    coverImage: ISSUE_1_PAGES[0],
    pages: [...ISSUE_1_PAGES],
    available: true,
    accent: "#C8963E",
    nextIssue: "Issue 2",
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
