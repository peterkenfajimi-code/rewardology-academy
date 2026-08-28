"use client";

import { useMemo, useState } from "react";
import { CATEGORY_ORDER, categoryLabel } from "@/lib/repository/category-labels";
import { MARKET_OPTIONS } from "@/lib/repository/market-labels";

export type ActiveFilter = {
  key: "country" | "industry" | "category" | "confidence";
  value: string;
  label: string;
};

type Props = {
  filters: ActiveFilter[];
  onChange: (filters: ActiveFilter[]) => void;
  industries: string[];
  matchCount: number;
  totalCount: number;
};

const CONFIDENCE_OPTIONS = [
  { value: "high", label: "High confidence" },
  { value: "medium", label: "Medium confidence" },
  { value: "low", label: "Low confidence" },
];

export function FilterChipBar({ filters, onChange, industries, matchCount, totalCount }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerKind, setPickerKind] = useState<ActiveFilter["key"] | "">("");

  const usedKeys = useMemo(() => new Set(filters.map((f) => f.key)), [filters]);

  function removeFilter(key: ActiveFilter["key"]) {
    onChange(filters.filter((f) => f.key !== key));
  }

  function addFilter(filter: ActiveFilter) {
    onChange([...filters.filter((f) => f.key !== filter.key), filter]);
    setPickerOpen(false);
    setPickerKind("");
  }

  function openPicker(kind: ActiveFilter["key"]) {
    setPickerKind(kind);
    setPickerOpen(true);
  }

  const pickerOptions = useMemo(() => {
    if (pickerKind === "country") {
      return MARKET_OPTIONS.map((m) => ({
        key: "country" as const,
        value: m.code,
        label: m.label,
      }));
    }
    if (pickerKind === "industry") {
      return industries.map((i) => ({ key: "industry" as const, value: i, label: i }));
    }
    if (pickerKind === "category") {
      return CATEGORY_ORDER.map((c) => ({
        key: "category" as const,
        value: c,
        label: categoryLabel(c),
      }));
    }
    if (pickerKind === "confidence") {
      return CONFIDENCE_OPTIONS.map((c) => ({
        key: "confidence" as const,
        value: c.value,
        label: c.label,
      }));
    }
    return [];
  }, [pickerKind, industries]);

  return (
    <div className="benefits-repo-filter-section">
      <div className="benefits-repo-filter-bar">
        {filters.map((f) => (
          <span key={f.key} className="benefits-repo-chip">
            {f.label}
            <button type="button" className="benefits-repo-chip-x" onClick={() => removeFilter(f.key)} aria-label={`Remove ${f.label}`}>
              ×
            </button>
          </span>
        ))}

        {!usedKeys.has("country") ? (
          <button type="button" className="benefits-repo-chip benefits-repo-chip-add" onClick={() => openPicker("country")}>
            + Country
          </button>
        ) : null}
        {!usedKeys.has("industry") && industries.length > 0 ? (
          <button type="button" className="benefits-repo-chip benefits-repo-chip-add" onClick={() => openPicker("industry")}>
            + Industry
          </button>
        ) : null}
        {!usedKeys.has("category") ? (
          <button type="button" className="benefits-repo-chip benefits-repo-chip-add" onClick={() => openPicker("category")}>
            + Category
          </button>
        ) : null}
        {!usedKeys.has("confidence") ? (
          <button type="button" className="benefits-repo-chip benefits-repo-chip-add" onClick={() => openPicker("confidence")}>
            + Confidence
          </button>
        ) : null}
      </div>

      {pickerOpen ? (
        <div className="benefits-repo-filter-picker">
          {pickerOptions.map((opt) => (
            <button
              key={`${opt.key}-${opt.value}`}
              type="button"
              onClick={() => addFilter({ key: opt.key, value: opt.value, label: opt.label })}
            >
              {opt.label}
            </button>
          ))}
          <button type="button" className="benefits-repo-filter-cancel" onClick={() => setPickerOpen(false)}>
            Cancel
          </button>
        </div>
      ) : null}

      <p className="benefits-repo-filter-note">
        {matchCount} of {totalCount} {totalCount === 1 ? "company" : "companies"} match
      </p>
    </div>
  );
}
