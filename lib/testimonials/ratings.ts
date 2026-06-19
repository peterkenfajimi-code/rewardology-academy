import type { TestimonialSourceType } from "@/lib/testimonials/types";

export type SourceRating = {
  average: number;
  count: number;
};

export type SourceRatings = {
  courses: Record<string, SourceRating>;
  quizzes: Record<string, SourceRating>;
  comics: Record<string, SourceRating>;
};

const EMPTY_RATINGS: SourceRatings = { courses: {}, quizzes: {}, comics: {} };

type RatingRow = {
  source_type: TestimonialSourceType;
  source_id: string;
  rating: number;
};

function bucketKey(type: TestimonialSourceType): keyof SourceRatings {
  if (type === "course") return "courses";
  if (type === "quiz") return "quizzes";
  return "comics";
}

/** Aggregate approved testimonial rows into per-source averages. */
export function aggregateSourceRatings(rows: RatingRow[]): SourceRatings {
  const totals: Record<
    keyof SourceRatings,
    Record<string, { sum: number; count: number }>
  > = { courses: {}, quizzes: {}, comics: {} };

  for (const row of rows) {
    if (!row.source_id || row.rating < 1 || row.rating > 5) continue;
    const bucket = bucketKey(row.source_type);
    const entry = totals[bucket][row.source_id] ?? { sum: 0, count: 0 };
    entry.sum += row.rating;
    entry.count += 1;
    totals[bucket][row.source_id] = entry;
  }

  const result: SourceRatings = { courses: {}, quizzes: {}, comics: {} };
  for (const bucket of ["courses", "quizzes", "comics"] as const) {
    for (const [id, { sum, count }] of Object.entries(totals[bucket])) {
      result[bucket][id] = {
        average: Math.round((sum / count) * 10) / 10,
        count,
      };
    }
  }
  return result;
}

export function getSourceRating(
  ratings: SourceRatings | null | undefined,
  sourceType: TestimonialSourceType,
  sourceId: string | number
): SourceRating | null {
  if (!ratings) return null;
  const bucket = bucketKey(sourceType);
  return ratings[bucket][String(sourceId)] ?? null;
}

export { EMPTY_RATINGS };
