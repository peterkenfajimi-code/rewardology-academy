import { describe, expect, it } from "vitest";
import { isNewsDataLimitError, NewsDataLimitError } from "./fetchNewsData";

describe("isNewsDataLimitError", () => {
  it("detects NewsDataLimitError instances", () => {
    expect(isNewsDataLimitError(new NewsDataLimitError("Rate Limit Exceeded"))).toBe(true);
  });

  it("detects rate limit messages on generic errors", () => {
    expect(isNewsDataLimitError(new Error("Too many requests"))).toBe(true);
    expect(isNewsDataLimitError(new Error("API credit limit reached"))).toBe(true);
  });

  it("ignores unrelated errors", () => {
    expect(isNewsDataLimitError(new Error("Unauthorized"))).toBe(false);
    expect(isNewsDataLimitError("not an error")).toBe(false);
  });
});
