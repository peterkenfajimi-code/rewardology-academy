import { describe, expect, it } from "vitest";
import { anthropicModelId } from "@/lib/repository/extract-benefits";

describe("anthropicModelId", () => {
  it("defaults to the current Sonnet alias when ANTHROPIC_MODEL is unset", () => {
    const previous = process.env.ANTHROPIC_MODEL;
    delete process.env.ANTHROPIC_MODEL;
    try {
      expect(anthropicModelId()).toBe("claude-sonnet-5");
    } finally {
      if (previous === undefined) delete process.env.ANTHROPIC_MODEL;
      else process.env.ANTHROPIC_MODEL = previous;
    }
  });
});
