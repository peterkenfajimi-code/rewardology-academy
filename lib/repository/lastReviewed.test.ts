import { describe, expect, it } from "vitest";
import { formatRepositoryReviewDate } from "@/lib/repository/lastReviewed";

describe("formatRepositoryReviewDate", () => {
  it("formats a UTC timestamp as a long British date", () => {
    expect(formatRepositoryReviewDate("2026-10-21T08:29:47.363Z")).toBe("21 October 2026");
  });
});
