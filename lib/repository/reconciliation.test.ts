import { describe, expect, it } from "vitest";
import {
  historicalDuplicateIds,
  incomingBeatsExisting,
  pickBestExisting,
  type ExistingEntry,
} from "@/lib/repository/reconciliation";

function row(patch: Partial<ExistingEntry> & { entry_id: string }): ExistingEntry {
  return {
    value: "10",
    source_trust_weight: 5,
    confidence_score: "high",
    date_collected: "2026-01-01",
    publish_status: "pending_verification",
    ...patch,
  };
}

describe("incomingBeatsExisting", () => {
  const existing = row({ entry_id: "a", source_trust_weight: 5, confidence_score: "medium" });

  it("wins on higher trust", () => {
    expect(incomingBeatsExisting(5, "high", { source_trust_weight: 2, confidence_score: "high" })).toBe(
      true
    );
  });

  it("wins on same trust and higher confidence", () => {
    expect(incomingBeatsExisting(5, "high", existing)).toBe(true);
  });

  it("does not win on a tie — held for review", () => {
    expect(incomingBeatsExisting(5, "medium", existing)).toBe(false);
  });

  it("does not win on lower trust even with higher confidence", () => {
    expect(
      incomingBeatsExisting(2, "high", { source_trust_weight: 5, confidence_score: "low" })
    ).toBe(false);
  });
});

describe("pickBestExisting", () => {
  it("prefers higher trust", () => {
    const best = pickBestExisting([
      row({ entry_id: "low", source_trust_weight: 2, publish_status: "published" }),
      row({ entry_id: "high", source_trust_weight: 5, publish_status: "pending_verification" }),
    ]);
    expect(best?.entry_id).toBe("high");
  });

  it("breaks a trust tie with confidence, then published status", () => {
    const best = pickBestExisting([
      row({
        entry_id: "pending",
        source_trust_weight: 5,
        confidence_score: "high",
        publish_status: "pending_verification",
      }),
      row({
        entry_id: "published",
        source_trust_weight: 5,
        confidence_score: "high",
        publish_status: "published",
      }),
    ]);
    expect(best?.entry_id).toBe("published");
  });

  it("returns null for an empty list", () => {
    expect(pickBestExisting([])).toBeNull();
  });
});

describe("historicalDuplicateIds", () => {
  const published = row({ entry_id: "pub", publish_status: "published" });
  const pendingA = row({ entry_id: "p1", publish_status: "pending_verification" });
  const pendingB = row({ entry_id: "p2", publish_status: "pending_verification" });

  it("retires every active row when the winner is being published", () => {
    expect(historicalDuplicateIds([published, pendingA, pendingB], true).sort()).toEqual([
      "p1",
      "p2",
      "pub",
    ]);
  });

  it("retires only pending rows when the winner stays pending — live published fact stays", () => {
    expect(historicalDuplicateIds([published, pendingA, pendingB], false).sort()).toEqual([
      "p1",
      "p2",
    ]);
  });
});
