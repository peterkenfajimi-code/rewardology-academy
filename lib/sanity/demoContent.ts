/** Fallback content when Sanity is not configured */
export const demoArticles = [
  {
    _id: "demo-1",
    title: "Pay Transparency Laws in the EU",
    slug: "pay-transparency-eu",
    excerpt: "What compensation leaders need to know for 2026 compliance.",
    publishedAt: "2026-05-01",
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "Pay transparency is reshaping how organizations communicate total rewards. Leaders must align job architecture, pay ranges, and manager enablement to stay compliant and competitive.",
          },
        ],
      },
    ],
  },
  {
    _id: "demo-2",
    title: "AI's Impact on Executive Compensation",
    slug: "ai-executive-compensation",
    excerpt: "How AI analytics are changing executive pay decisions.",
    publishedAt: "2026-05-10",
    body: [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: "AI tools now help boards benchmark executive pay faster, detect pay equity risks, and model incentive outcomes. The best programs combine data science with governance discipline.",
          },
        ],
      },
    ],
  },
];

export const demoCourses = [
  {
    _id: "course-1",
    title: "Compensation Fundamentals",
    slug: "compensation-fundamentals",
    summary: "Build salary structures and job evaluation foundations.",
    level: "Beginner",
    isFree: true,
    price: 0,
  },
  {
    _id: "course-2",
    title: "Executive Compensation Design",
    slug: "executive-compensation",
    summary: "LTI, governance, and board-ready pay programs.",
    level: "Advanced",
    isFree: false,
    price: 149,
  },
];
