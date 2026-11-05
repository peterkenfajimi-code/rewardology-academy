import { describe, expect, it } from "vitest";
import {
  GROUP_SCOPE_BULLETS,
  GROUP_SCOPE_PROMPT_BLOCK,
  LISTED_HOLDING_GROUP_SCOPE_BULLETS,
} from "@/lib/repository/group-scope";
import { buildExtractionInstructions } from "@/lib/repository/extraction-prompt";

describe("group / listed-entity scope wording", () => {
  it("prompt block uses the five standing sentences", () => {
    for (const line of GROUP_SCOPE_BULLETS) {
      expect(GROUP_SCOPE_PROMPT_BLOCK).toContain(line);
    }
  });

  it("prompt block adds the holding-company inversion for multi-country Group rows", () => {
    for (const line of LISTED_HOLDING_GROUP_SCOPE_BULLETS) {
      expect(GROUP_SCOPE_PROMPT_BLOCK).toContain(line);
    }
  });

  it("extraction instructions include the shared prompt block", () => {
    const instructions = buildExtractionInstructions("Acme", null, []);
    expect(instructions).toContain(GROUP_SCOPE_PROMPT_BLOCK);
  });
});
