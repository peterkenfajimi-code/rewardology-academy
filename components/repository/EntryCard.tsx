"use client";

import { categoryLabel } from "@/lib/repository/category-labels";
import { formatStatValue } from "@/lib/repository/format-stat-value";
import type { PublicBenefitEntry } from "@/lib/repository/load-public-entries";
import { formatEffectiveDateBadge, isEntryStale } from "@/lib/repository/staleness";
import { MonoNumbers } from "@/components/repository/MonoNumbers";
import { SourceCitation } from "@/components/repository/SourceCitation";

function confidenceClass(score: string): string {
  if (score === "high") return "benefits-repo-confidence benefits-repo-confidence-high";
  if (score === "medium") return "benefits-repo-confidence benefits-repo-confidence-medium";
  return "benefits-repo-confidence benefits-repo-confidence-low";
}

type Props = {
  row: PublicBenefitEntry;
};

export function EntryCard({ row }: Props) {
  const stale = isEntryStale(row.effective_date);
  const dateBadge = row.effective_date ? formatEffectiveDateBadge(row.effective_date) : null;
  const isQuantified = row.value_type === "quantified";
  const stat = isQuantified ? formatStatValue(row.value, row.field_label) : null;

  return (
    <article
      className={`benefits-repo-card benefits-repo-card-enter ${isQuantified ? "benefits-repo-stat-card" : "benefits-repo-narrative-card"}`}
    >
      <div className="benefits-repo-card-top">
        <p className="benefits-repo-field">{categoryLabel(row.category)}</p>
        <span className={confidenceClass(row.confidence_score)} title="Confidence">
          {row.confidence_score}
        </span>
      </div>

      {isQuantified && stat ? (
        <>
          <div className="benefits-repo-stat-hero">
            <span className="benefits-repo-stat-number">{stat.number}</span>
            {stat.unit ? <span className="benefits-repo-stat-unit">{stat.unit}</span> : null}
          </div>
          <p className="benefits-repo-stat-caption">
            <MonoNumbers text={row.display_text} />
          </p>
        </>
      ) : (
        <p className="benefits-repo-value">
          <MonoNumbers text={row.display_text} />
        </p>
      )}

      <p className="benefits-repo-meta">
        {dateBadge ? (
          <span className={stale ? "benefits-repo-stale" : ""}>
            as of {dateBadge}
            {stale ? " · may be outdated" : ""}
          </span>
        ) : null}
        {row.confidence_was_clamped ? (
          <span className="benefits-repo-clamped"> · confidence capped per field rules</span>
        ) : null}
      </p>

      <p className="benefits-repo-source">
        Source: <SourceCitation source={row.sources} />
      </p>
    </article>
  );
}
