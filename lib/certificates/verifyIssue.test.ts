import { describe, expect, it } from "vitest";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import {
  ignoreClientIssueScore,
  publicCertificateFromStored,
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

  it("rejects a tampered client scorePct", () => {
    const stored = verifiedQuizCentreCertificate(
      "1",
      { best_score: 2, best_total: 10, best_xp: 30, updated_at: "2026-01-01T00:00:00.000Z" },
      "Ada"
    );
    expect(stored).not.toBeNull();
    const issued = ignoreClientIssueScore(stored!, { scorePct: 100, xpEarned: 9999 });
    const total = QUIZ_CENTRE.find((q) => q.id === 1)!.questions.length;
    const expected = Math.round((2 / total) * 100);
    expect(issued.scorePct).toBe(expected);
    expect(issued.scorePct).not.toBe(100);
    expect(issued.xpEarned).not.toBe(9999);
  });
});

describe("publicCertificateFromStored", () => {
  it("still validates an existing legitimate certificate", () => {
    const cert = publicCertificateFromStored({
      id: "RA-ABCDEF12",
      cert_type: "quiz_centre",
      source_id: "1",
      recipient_name: "Ada",
      credential_name: "Total Rewards Foundations",
      credential_detail: "Quiz Centre",
      score_pct: 80,
      xp_earned: 40,
      issued_at: "2026-06-01T00:00:00.000Z",
    });
    expect(cert.verified).toBe(true);
    expect(cert.id).toBe("RA-ABCDEF12");
    expect(cert.scorePct).toBe(80);
    expect(cert.recipientName).toBe("Ada");
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
