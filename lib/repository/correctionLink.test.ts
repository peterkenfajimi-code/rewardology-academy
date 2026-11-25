import { describe, expect, it } from "vitest";
import {
  REPOSITORY_CORRECTION_EMAIL,
  SUPERSEDED_FINDINGS_SENTENCE,
  repositoryCorrectionMailto,
  repositoryCorrectionSubject,
} from "@/lib/repository/correctionLink";

describe("repositoryCorrectionLink", () => {
  it("publishes the approved hello@ mailto", () => {
    expect(REPOSITORY_CORRECTION_EMAIL).toBe("hello@rewardologyacademy.com");
    expect(repositoryCorrectionMailto()).toBe(
      "mailto:hello@rewardologyacademy.com?subject=Africa%20Benefits%20Repository%20correction"
    );
    expect(repositoryCorrectionMailto("KCB Group Plc")).toContain("mailto:hello@rewardologyacademy.com");
    expect(repositoryCorrectionSubject("KCB Group Plc")).toBe(
      "Africa Benefits Repository correction — KCB Group Plc"
    );
  });

  it("keeps superseded findings on record without verified or endorsed wording", () => {
    expect(SUPERSEDED_FINDINGS_SENTENCE).toBe(
      "Superseded findings are kept on record, not deleted, and are available on request through the correction process."
    );
    expect(SUPERSEDED_FINDINGS_SENTENCE.toLowerCase()).not.toMatch(/verif|endors|partner/);
  });
});
