import type { ConfidenceMix } from "@/lib/repository/confidence-mix";
import { confidenceMixLegend } from "@/lib/repository/confidence-mix";

type Props = {
  mix: ConfidenceMix;
  expanded?: boolean;
  className?: string;
};

export function ConfidenceMixBar({ mix, expanded = false, className = "" }: Props) {
  if (mix.total === 0) {
    return <span className={`benefits-repo-muted ${className}`.trim()}>No entries</span>;
  }

  return (
    <div className={`benefits-repo-confidence-wrap ${className}`.trim()}>
      <div
        className="benefits-repo-confidence-mix"
        role="img"
        aria-label={confidenceMixLegend(mix)}
      >
        {mix.highPct > 0 ? (
          <span className="benefits-repo-mix-high" style={{ width: `${mix.highPct}%` }} />
        ) : null}
        {mix.mediumPct > 0 ? (
          <span className="benefits-repo-mix-medium" style={{ width: `${mix.mediumPct}%` }} />
        ) : null}
        {mix.lowPct > 0 ? (
          <span className="benefits-repo-mix-low" style={{ width: `${mix.lowPct}%` }} />
        ) : null}
      </div>
      {expanded ? (
        <p className="benefits-repo-confidence-legend">{confidenceMixLegend(mix)}</p>
      ) : null}
    </div>
  );
}
