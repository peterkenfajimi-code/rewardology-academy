import { describe, expect, it } from "vitest";
import { aggregateSourceRatings, getSourceRating } from "./ratings";

describe("aggregateSourceRatings", () => {
  it("averages ratings per source", () => {
    const result = aggregateSourceRatings([
      { source_type: "course", source_id: "1", rating: 5 },
      { source_type: "course", source_id: "1", rating: 4 },
      { source_type: "quiz", source_id: "2", rating: 3 },
    ]);

    expect(result.courses["1"]).toEqual({ average: 4.5, count: 2 });
    expect(result.quizzes["2"]).toEqual({ average: 3, count: 1 });
    expect(getSourceRating(result, "course", 1)).toEqual({ average: 4.5, count: 2 });
  });
});
