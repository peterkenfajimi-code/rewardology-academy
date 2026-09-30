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

  it("keeps performance-bonus and cellphone-allowance passages but not bonus share issues", () => {
    const filler = "Revenue grew strongly in the year across all operating segments and markets, driven by data and fintech.";
    const text = [
      "The Board approved a bonus issue of one new share for every ten held, credited as fully paid to shareholders.",
      filler,
      filler,
      "All permanent staff participate in an annual performance bonus scheme and receive a monthly cellphone allowance.",
    ].join("\n\n");

    const excerpt = selectBenefitsExcerpt(text);
    expect(excerpt).toContain("annual performance bonus");
    expect(excerpt).not.toContain("bonus issue");
  });
});
