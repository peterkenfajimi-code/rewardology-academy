import { describe, expect, it } from "vitest";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import {
  sanitizeRecipientName,
  verifiedDailyQuizCertificate,
  verifiedQuizCentreCertificate,
} from "@/lib/certificates/verifyIssue";

describe("sanitizeRecipientName", () => {
  it("strips markup and requires a real name", () => {
    expect(sanitizeRecipientName("  <b>Ada</b>  ")).toBe("Ada");
    expect(sanitizeRecipientName("A")).toBeNull();
  });
});

describe("verifiedQuizCentreCertificate", () => {
  it("uses stored best score, not a client-supplied percentage", () => {
    const quiz = verifiedQuizCentreCertificate(
      "1",
      { best_score: 2, best_total: 10, best_xp: 30, updated_at: "2026-01-01T00:00:00.000Z" },
      "Ada"
    );
    const total = QUIZ_CENTRE.find((q) => q.id === 1)!.questions.length;
    expect(quiz?.scorePct).toBe(Math.round((2 / total) * 100));
    expect(quiz?.credentialName).toBeTruthy();
    expect(verifiedQuizCentreCertificate("1", null, "Ada")).toBeNull();
  });
});

describe("verifiedDailyQuizCertificate", () => {
  it("records 100 or 0 from the server correctness flag", () => {
    const pass = verifiedDailyQuizCertificate(
      "2026-01-15",
      { correct: true, xp_earned: 10, created_at: "2026-01-15T12:00:00.000Z" },
      "Ada"
    );
    const fail = verifiedDailyQuizCertificate(
      "2026-01-15",
      { correct: false, xp_earned: 0, created_at: "2026-01-15T12:00:00.000Z" },
      "Ada"
    );
    expect(pass?.scorePct).toBe(100);
    expect(fail?.scorePct).toBe(0);
    expect(verifiedDailyQuizCertificate("not-a-date", pass && { correct: true, xp_earned: 10, created_at: "" }, "Ada")).toBeNull();
  });
});
