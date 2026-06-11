import { describe, expect, it } from "vitest";
import { prepareTextForTts } from "./prepareText";

describe("prepareTextForTts", () => {
  it("joins sections with spaces by default", () => {
    expect(prepareTextForTts("Hello.\n\nWorld.")).toBe("Hello. World.");
  });

  it("inserts SSML breaks when requested", () => {
    expect(prepareTextForTts("Hello.\n\nWorld.", true)).toContain("<break");
  });

  it("expands HR abbreviations", () => {
    expect(prepareTextForTts("HR leaders drive strategy.")).toContain("Human Resources");
  });
});
