/** Split a quantified value into a hero number and optional unit label. */
export function formatStatValue(
  value: string | null,
  fieldLabel: string | null
): { number: string; unit: string | null } {
  const raw = (value ?? "").trim();
  if (!raw) return { number: "—", unit: null };

  const pct = raw.match(/^(\d+(?:\.\d+)?)\s*%$/);
  if (pct) return { number: pct[1], unit: "%" };

  const multiple = raw.match(/^(\d+(?:\.\d+)?)\s*x\b/i);
  if (multiple) return { number: multiple[1], unit: "× salary" };

  const days = raw.match(/^(\d+(?:\.\d+)?)\s*(days?)\b/i);
  if (days) return { number: days[1], unit: "days" };

  const numOnly = raw.match(/^(\d+(?:,\d{3})*(?:\.\d+)?)$/);
  if (numOnly) {
    const label = (fieldLabel ?? "").toLowerCase();
    if (label.includes("%") || label.includes("percent")) return { number: numOnly[1], unit: "%" };
    if (label.includes("day")) return { number: numOnly[1], unit: "days" };
    if (label.includes("multiple") || label.includes("×")) return { number: numOnly[1], unit: "×" };
    return { number: numOnly[1], unit: null };
  }

  const leadingNum = raw.match(/^(\d+(?:,\d{3})*(?:\.\d+)?)/);
  if (leadingNum) return { number: leadingNum[1], unit: null };

  return { number: raw, unit: null };
}
