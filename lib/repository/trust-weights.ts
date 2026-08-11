import type { ConfidenceScore, SourceType } from "@/lib/repository/types";

const TRUST_WEIGHTS: Record<SourceType, number> = {
  annual_report: 5,
  direct_confirmation: 5,
  regulatory_filing: 4,
  press_release: 3,
  linkedin: 2,
  careers_page: 2,
  award_recognition: 1,
};

export function trustWeightForSourceType(sourceType: SourceType): number {
  return TRUST_WEIGHTS[sourceType] ?? 1;
}

const CONFIDENCE_RANK: Record<ConfidenceScore, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function compareConfidence(a: ConfidenceScore, b: ConfidenceScore): number {
  return CONFIDENCE_RANK[a] - CONFIDENCE_RANK[b];
}
