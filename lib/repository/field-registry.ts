import type { SupabaseClient } from "@supabase/supabase-js";
import { compareConfidence } from "@/lib/repository/trust-weights";
import type { BenefitCategory, ConfidenceScore } from "@/lib/repository/types";

export type FieldRegistryRow = {
  category: BenefitCategory;
  field_key: string;
  field_label: string;
  value_type: string;
  max_confidence: ConfidenceScore;
  description: string | null;
  display_template: string | null;
};

export type RegistryClampResult = {
  confidence_score: ConfidenceScore;
  confidence_was_clamped: boolean;
  notes: string | null;
};

export function isUnmappedField(field: string): boolean {
  return field.trim().toLowerCase() === "unmapped";
}

export async function loadFieldRegistry(
  supabase: SupabaseClient,
  category?: BenefitCategory
): Promise<FieldRegistryRow[]> {
  let query = supabase
    .from("benefit_field_registry")
    .select("category, field_key, field_label, value_type, max_confidence, description, display_template")
    .order("category")
    .order("field_key");

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw new Error(`Could not load field registry: ${error.message}`);
  return (data ?? []) as FieldRegistryRow[];
}

export function formatRegistryForPrompt(rows: FieldRegistryRow[]): string {
  const byCategory = new Map<string, FieldRegistryRow[]>();
  for (const row of rows) {
    const bucket = byCategory.get(row.category) ?? [];
    bucket.push(row);
    byCategory.set(row.category, bucket);
  }

  const lines: string[] = [];
  for (const [category, fields] of byCategory) {
    lines.push(`\n${category}:`);
    for (const field of fields) {
      lines.push(`  - ${field.field_key} (${field.field_label}) [max confidence: ${field.max_confidence}]`);
    }
  }
  return lines.join("\n");
}

export function clampConfidenceToRegistry(
  submitted: ConfidenceScore,
  maxConfidence: ConfidenceScore,
  existingNotes?: string | null
): RegistryClampResult {
  if (compareConfidence(submitted, maxConfidence) <= 0) {
    return {
      confidence_score: submitted,
      confidence_was_clamped: false,
      notes: existingNotes ?? null,
    };
  }

  const clampNote = `AI suggested ${submitted} confidence; capped to ${maxConfidence} per field registry rules.`;
  const notes = existingNotes?.trim() ? `${existingNotes.trim()} ${clampNote}` : clampNote;

  return {
    confidence_score: maxConfidence,
    confidence_was_clamped: true,
    notes,
  };
}

export function renderDisplayText(
  template: string | null | undefined,
  companyName: string,
  value: string | null | undefined,
  fieldLabel?: string | null
): string {
  const displayValue = value?.trim() || "—";
  if (template?.trim()) {
    return template.replace(/\{company\}/g, companyName).replace(/\{value\}/g, displayValue);
  }
  if (fieldLabel) return `${fieldLabel}: ${displayValue}`;
  return displayValue;
}

export function registryKey(category: string, field: string): string {
  return `${category}::${field}`;
}

export function indexRegistry(rows: FieldRegistryRow[]): Map<string, FieldRegistryRow> {
  const map = new Map<string, FieldRegistryRow>();
  for (const row of rows) {
    map.set(registryKey(row.category, row.field_key), row);
  }
  return map;
}

export type ValueTypeValidation = {
  matches: boolean;
  reason: string | null;
};

/** Compare extracted value shape against the registry's declared value_type before save. */
export function validateExtractedValueType(
  registryValueType: string,
  extractedValueType: string,
  field: string,
  value: string | null | undefined
): ValueTypeValidation {
  const v = (value ?? "").trim();
  if (!v) return { matches: true, reason: null };

  if (extractedValueType !== registryValueType) {
    return {
      matches: false,
      reason: `Extracted value_type "${extractedValueType}" does not match registry "${registryValueType}" for ${field}.`,
    };
  }

  switch (registryValueType) {
    case "quantified": {
      const hasNumber = /\d/.test(v);
      const looksNarrative =
        v.length > 80 ||
        /\b(recognized|recorded|liability|included in|expenses|accrued leave)\b/i.test(v);
      if (!hasNumber || looksNarrative) {
        return {
          matches: false,
          reason: `Quantified field ${field} value does not look numeric: "${v.slice(0, 80)}".`,
        };
      }
      break;
    }
    case "compliance_status": {
      if (!/^(yes|no)\.?$/i.test(v)) {
        return {
          matches: false,
          reason: `Compliance field ${field} should be Yes/No, got "${v.slice(0, 80)}".`,
        };
      }
      break;
    }
    case "named_program": {
      if (/^(yes|no)\.?$/i.test(v)) {
        return {
          matches: false,
          reason: `Named-program field ${field} should name/describe a scheme, not Yes/No alone.`,
        };
      }
      break;
    }
    default:
      break;
  }

  return { matches: true, reason: null };
}
