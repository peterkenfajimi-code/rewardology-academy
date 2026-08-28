export type ConfidenceLevel = "high" | "medium" | "low";

export type ConfidenceMix = {
  high: number;
  medium: number;
  low: number;
  total: number;
  highPct: number;
  mediumPct: number;
  lowPct: number;
};

export function computeConfidenceMix(scores: string[]): ConfidenceMix {
  let high = 0;
  let medium = 0;
  let low = 0;
  for (const score of scores) {
    if (score === "high") high += 1;
    else if (score === "medium") medium += 1;
    else low += 1;
  }
  const total = high + medium + low;
  if (total === 0) {
    return { high: 0, medium: 0, low: 0, total: 0, highPct: 0, mediumPct: 0, lowPct: 0 };
  }
  return {
    high,
    medium,
    low,
    total,
    highPct: Math.round((high / total) * 100),
    mediumPct: Math.round((medium / total) * 100),
    lowPct: Math.round((low / total) * 100),
  };
}

export function confidenceMixLegend(mix: ConfidenceMix): string {
  if (mix.total === 0) return "No published entries";
  return `High ${mix.highPct}% · Medium ${mix.mediumPct}% · Low ${mix.lowPct}%`;
}
