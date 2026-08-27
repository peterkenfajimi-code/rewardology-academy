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
  "6-1-2": { toolId: "t18", label: "Open: STI Framework Planner" },
  "6-2-2": { toolId: "t19", label: "Open: Payout Curve Calculator" },
  "6-3-2": { toolId: "t20", label: "Open: Governance Gate Checklist" },
  "6-4-2": { toolId: "t21", label: "Open: Manager Briefing Template" },
  "7-1-2": { toolId: "t22", label: "Open: Benefits Portfolio Auditor" },
  "7-2-2": { toolId: "t23", label: "Open: Health Plan Cost Comparison" },
  "7-3-2": { toolId: "t24", label: "Open: DC Pension Contribution Modeller" },
  "7-4-2": { toolId: "t25", label: "Open: Flex Benefits Budget Planner" },
  "8-2-2": { toolId: "t26", label: "Open: LTI Vehicle Selector" },
  "8-3-2": { toolId: "t27", label: "Open: PSU Vesting Schedule Builder" },
  "9-1-2": { toolId: "t28", label: "Open: TTC Benchmarking Worksheet" },
  "9-2-2": { toolId: "t29", label: "Open: Commission Payout Table Builder" },
  "9-3-2": { toolId: "t30", label: "Open: Quota Attainment Distribution Analyser" },
  "10-2-2": { toolId: "t31", label: "Open: Geographic Differential Matrix" },
  "10-3-2": { toolId: "t32", label: "Open: Expat Balance Sheet Calculator" },
};

export const TOOLKIT_HTML_PATH = "/toolkit/rewardology-toolkit.html";

export function toolkitUrlForLesson(lessonId: string): string | null {
  const entry = TOOLKIT_MAP[lessonId];
  if (!entry) return null;
  return `${TOOLKIT_HTML_PATH}#${entry.toolId}`;
}
