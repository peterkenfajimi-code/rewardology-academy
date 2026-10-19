import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  TRAINING_SPEND_AMOUNT_REGISTRY_DESCRIPTION,
  TRAINING_SPEND_BULLETS,
  TRAINING_SPEND_PROMPT_BLOCK,
  TRAINING_SPEND_REGISTRY_SUFFIX,
} from "@/lib/repository/training-spend";
import { buildExtractionInstructions } from "@/lib/repository/extraction-prompt";

const root = path.resolve(__dirname, "../..");

function sqlUnescape(sql: string): string {
  return sql.replace(/''/g, "'");
}

describe("training spend wording lockstep", () => {
  it("prompt block and registry description use the same four sentences", () => {
    for (const line of TRAINING_SPEND_BULLETS) {
      expect(TRAINING_SPEND_PROMPT_BLOCK).toContain(line);
      expect(TRAINING_SPEND_REGISTRY_SUFFIX).toContain(line);
      expect(TRAINING_SPEND_AMOUNT_REGISTRY_DESCRIPTION).toContain(line);
    }
  });

  it("extraction instructions include the shared prompt block", () => {
    const instructions = buildExtractionInstructions("Acme", null, []);
    expect(instructions).toContain(TRAINING_SPEND_PROMPT_BLOCK);
  });

  it("migration 024 stores the same description text as the shared helper", () => {
    const sql024 = sqlUnescape(
      fs.readFileSync(
        path.join(root, "supabase/benefits-repository/migrations/024_training_spend_scope.sql"),
        "utf8"
      )
    );
    expect(sql024).toContain(TRAINING_SPEND_AMOUNT_REGISTRY_DESCRIPTION);
  });
});
