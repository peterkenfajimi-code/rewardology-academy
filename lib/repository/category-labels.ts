import type { BenefitCategory } from "@/lib/repository/types";

export const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  retirement: "Retirement",
  health: "Health",
  risk_insurance: "Risk & Insurance",
  leave: "Leave",
  allowances: "Allowances",
  development: "Development",
  equity_variable: "Equity & Variable",
  other_voluntary: "Other Voluntary",
};

export const CATEGORY_ORDER: BenefitCategory[] = [
  "retirement",
  "health",
  "risk_insurance",
  "leave",
  "allowances",
  "development",
  "equity_variable",
  "other_voluntary",
];

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category as BenefitCategory] ?? category;
}
