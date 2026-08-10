export type ToolkitEntry = {
  toolId: string;
  label: string;
};

/** Course lesson IDs → practitioner toolkit deep links (hash opens tool in static HTML). */
export const TOOLKIT_MAP: Record<string, ToolkitEntry> = {
  "1-1-2": { toolId: "t01", label: "Open: Five Pillars Diagnostic" },
  "1-4-2": { toolId: "t02", label: "Open: Total Reward Statement Builder" },
  "2-1-2": { toolId: "t03", label: "Open: Salary Range Builder" },
  "2-2-2": { toolId: "t04", label: "Open: Market Pricing Worksheet" },
  "2-3-2": { toolId: "t05", label: "Open: Benefits Budget Calculator" },
  "2-4-2": { toolId: "t06", label: "Open: Approval Matrix Builder" },
  "3-1-2": { toolId: "t07", label: "Open: Point-Factor Evaluation Scorecard" },
  "3-2-2": { toolId: "t08", label: "Open: Pay Gap Calculator" },
  "3-3-2": { toolId: "t10", label: "Open: Pay Equity Audit Checklist" },
  "3-4-2": { toolId: "t09", label: "Open: Remediation Budget Calculator" },
  "4-1-2": { toolId: "t11", label: "Open: Transparency Maturity Assessment" },
  "4-3-2": { toolId: "t12", label: "Open: Manager Briefing Pack" },
  "4-4-2": { toolId: "t13", label: "Open: Total Reward Statement Template" },
  "5-1-2": { toolId: "t14", label: "Open: Compa-Ratio Distribution Analyser" },
  "5-2-2": { toolId: "t15", label: "Open: Flight-Risk Scoring Tool" },
  "5-3-2": { toolId: "t16", label: "Open: Turnover Cost & ROI Calculator" },
  "5-4-2": { toolId: "t17", label: "Open: Career Lattice Mapping Tool" },
};

export const TOOLKIT_HTML_PATH = "/toolkit/rewardology-toolkit.html";

export function toolkitUrlForLesson(lessonId: string): string | null {
  const entry = TOOLKIT_MAP[lessonId];
  if (!entry) return null;
  return `${TOOLKIT_HTML_PATH}#${entry.toolId}`;
}
