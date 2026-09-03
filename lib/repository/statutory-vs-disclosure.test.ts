import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  contributionPctRegistryDescription,
  STATUTORY_VS_DISCLOSURE_BULLETS,
  STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK,
  STATUTORY_VS_DISCLOSURE_REGISTRY_SUFFIX,
} from "@/lib/repository/statutory-vs-disclosure";
import { buildExtractionInstructions } from "@/lib/repository/extraction-prompt";

const root = path.resolve(__dirname, "../..");

function sqlUnescape(sql: string): string {
  return sql.replace(/''/g, "'");
}

describe("statutory vs disclosure wording lockstep", () => {
  it("prompt block and registry suffix use the same four sentences", () => {
    for (const line of STATUTORY_VS_DISCLOSURE_BULLETS) {
      expect(STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK).toContain(line);
      expect(STATUTORY_VS_DISCLOSURE_REGISTRY_SUFFIX).toContain(line);
      expect(contributionPctRegistryDescription("employer")).toContain(line);
      expect(contributionPctRegistryDescription("employee")).toContain(line);
    }
  });

  it("extraction instructions include the shared prompt block", () => {
    const instructions = buildExtractionInstructions("Acme", null, []);
    expect(instructions).toContain(STATUTORY_VS_DISCLOSURE_PROMPT_BLOCK);
  });

  it("migrations 006 and 012 store the same description text as the shared helper", () => {
    const sql006 = sqlUnescape(
      fs.readFileSync(path.join(root, "supabase/benefits-repository/migrations/006_field_registry.sql"), "utf8")
    );
    const sql012 = sqlUnescape(
      fs.readFileSync(
        path.join(root, "supabase/benefits-repository/migrations/012_statutory_vs_company_rate.sql"),
        "utf8"
      )
    );
    expect(sql006).toContain(contributionPctRegistryDescription("employer"));
    expect(sql006).toContain(contributionPctRegistryDescription("employee"));
    expect(sql012).toContain(contributionPctRegistryDescription("employer"));
    expect(sql012).toContain(contributionPctRegistryDescription("employee"));
  });
});
