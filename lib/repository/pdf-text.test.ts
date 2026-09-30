import { describe, expect, it } from "vitest";
import { selectBenefitsExcerpt } from "@/lib/repository/pdf-text";

describe("selectBenefitsExcerpt", () => {
  it("keeps funeral and leave-allowance passages but not ECL loss-allowance text", () => {
    const filler = "Revenue grew strongly in the year across all operating segments and markets, driven by data and fintech.";
    const text = [
      "The Group records an allowance for expected credit loss for all loans and other debt financial assets not held at FVTPL.",
      filler,
      filler,
      "Employees receive a funeral benefit covering the employee, spouse and children, and a leave allowance of 10% of annual basic salary.",
    ].join("\n\n");

    const excerpt = selectBenefitsExcerpt(text);
    expect(excerpt).toContain("funeral benefit");
    expect(excerpt).not.toContain("expected credit loss");
  });
});
