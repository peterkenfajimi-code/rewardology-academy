import type { SupabaseClient } from "@supabase/supabase-js";

import { isExcludedBenefitField } from "@/lib/repository/collection-policy";

import { parseEffectiveDate } from "@/lib/repository/effective-date";

import {

  clampConfidenceToRegistry,

  indexRegistry,

  isUnmappedField,

  loadFieldRegistry,

  validateExtractedValueType,

} from "@/lib/repository/field-registry";

import { requiresLegalReview } from "@/lib/repository/legal-review";
import { normalizeComplianceStatusValue } from "@/lib/repository/compliance-status";
import { compareConfidence, trustWeightForSourceType } from "@/lib/repository/trust-weights";

import type {

  ConfidenceScore,

  ExtractedEntry,

  PublishStatus,

  SourceType,

} from "@/lib/repository/types";



type ExistingEntry = {

  entry_id: string;

  value: string | null;

  source_trust_weight: number | null;

  confidence_score: ConfidenceScore;

  date_collected: string;

  publish_status: PublishStatus;

};



export type SaveEntryInput = ExtractedEntry & {

  publish?: boolean;

};



export type SaveEntryResult = {

  entry_id: string;

  publish_status: PublishStatus;

  action:

    | "inserted"

    | "superseded_conflict"

    | "kept_existing"

    | "pending_conflict"

    | "duplicate"

    | "unmapped_skipped"

    | "registry_rejected"

    | "value_type_mismatch";

  confidence_was_clamped?: boolean;

  original_confidence?: ConfidenceScore;

};



function normalizeValue(value: string | null | undefined): string {

  return (value ?? "").trim().toLowerCase();

}

function appendNote(notes: string | null | undefined, extra: string | null): string | null {
  if (!extra) return notes ?? null;
  return notes?.trim() ? `${notes.trim()} ${extra}` : extra;
}



export async function saveEntriesWithReconciliation(

  supabase: SupabaseClient,

  params: {

    companyId: string;

    sourceId: string;

    sourceType: SourceType;

    actor: string;

    entries: SaveEntryInput[];

  }

): Promise<SaveEntryResult[]> {

  const results: SaveEntryResult[] = [];

  const trustWeight = trustWeightForSourceType(params.sourceType);

  const registryRows = await loadFieldRegistry(supabase);

  const registryByKey = indexRegistry(registryRows);



  for (const entry of params.entries) {

    if (isUnmappedField(entry.field)) {

      results.push({

        entry_id: "",

        publish_status: "pending_verification",

        action: "unmapped_skipped",

      });

      continue;

    }



    if (isExcludedBenefitField(entry.field)) continue;



    const registryRow = registryByKey.get(`${entry.category}::${entry.field}`);

    if (!registryRow) {

      results.push({

        entry_id: "",

        publish_status: "pending_verification",

        action: "registry_rejected",

      });

      continue;

    }



    const originalConfidence = entry.confidence_score;

    const clamped = clampConfidenceToRegistry(

      entry.confidence_score,

      registryRow.max_confidence,

      entry.notes

    );

    const normalizedValue = normalizeComplianceStatusValue(
      entry.field,
      entry.value,
      entry.value_type
    );
    const entryValue = normalizedValue;

    const valueTypeCheck = validateExtractedValueType(
      registryRow.value_type,
      entry.value_type,
      entry.field,
      entryValue
    );

    let valueTypeNote: string | null = null;
    if (!valueTypeCheck.matches) {
      valueTypeNote = valueTypeCheck.reason;
    }



    const { data: existingRows } = await supabase

      .from("benefit_entries")

      .select("entry_id, value, source_trust_weight, confidence_score, date_collected, publish_status")

      .eq("company_id", params.companyId)

      .eq("category", entry.category)

      .eq("field", entry.field)

      .in("publish_status", ["published", "pending_verification"]);



    const existing = (existingRows?.[0] as ExistingEntry | undefined) ?? null;



    if (existing && normalizeValue(existing.value) === normalizeValue(entryValue)) {

      results.push({

        entry_id: existing.entry_id,

        publish_status: existing.publish_status,

        action: "duplicate",

      });

      continue;

    }



    let publishStatus: PublishStatus = entry.publish ? "published" : "pending_verification";

    if (valueTypeNote) {
      publishStatus = "pending_verification";
    }

    const legalReview = requiresLegalReview(

      entry.category,

      params.sourceType,

      entry.value,

      entry.value_type

    );

    if (legalReview) publishStatus = "pending_verification";



    if (existing) {

      const oldWeight = existing.source_trust_weight ?? 0;

      const newWins =

        trustWeight > oldWeight ||

        (trustWeight === oldWeight &&

          compareConfidence(clamped.confidence_score, existing.confidence_score) > 0);



      if (!newWins) {

        const effectiveDate = parseEffectiveDate(entry.fiscal_year_or_effective_date);

        const { data: pendingInsert, error: pendingError } = await supabase

          .from("benefit_entries")

          .insert({

            company_id: params.companyId,

            source_id: params.sourceId,

            category: entry.category,

            field: entry.field,

            value: entryValue,

            value_type: entry.value_type,

            fiscal_year_or_effective_date: entry.fiscal_year_or_effective_date ?? null,

            effective_date: effectiveDate,

            confidence_score: clamped.confidence_score,

            confidence_was_clamped: clamped.confidence_was_clamped,

            source_trust_weight: trustWeight,

            publish_status: "pending_verification",

            notes: appendNote(clamped.notes, valueTypeNote),

            verified_by: params.actor,

          })

          .select("entry_id, publish_status")

          .single();



        if (pendingError || !pendingInsert) {

          throw new Error(pendingError?.message ?? "Could not save pending conflict entry");

        }



        await supabase.from("verification_log").insert({

          entry_id: pendingInsert.entry_id,

          action: "pending_conflict",

          actor: params.actor,

          detail: `Lower-trust incoming entry for ${entry.field} (trust ${trustWeight}) conflicts with existing ${existing.publish_status} entry (trust ${oldWeight}) — held for review.`,

        });



        results.push({

          entry_id: pendingInsert.entry_id,

          publish_status: "pending_verification",

          action: "pending_conflict",

          confidence_was_clamped: clamped.confidence_was_clamped,

          original_confidence: clamped.confidence_was_clamped ? originalConfidence : undefined,

        });

        continue;

      }



      if (existing.publish_status === "published" && publishStatus === "published") {

        await supabase

          .from("benefit_entries")

          .update({ publish_status: "superseded" })

          .eq("entry_id", existing.entry_id);

      }

    }



    const effectiveDate = parseEffectiveDate(entry.fiscal_year_or_effective_date);



    const { data: inserted, error } = await supabase

      .from("benefit_entries")

      .insert({

        company_id: params.companyId,

        source_id: params.sourceId,

        category: entry.category,

        field: entry.field,

        value: entryValue,

        value_type: entry.value_type,

        fiscal_year_or_effective_date: entry.fiscal_year_or_effective_date ?? null,

        effective_date: effectiveDate,

        confidence_score: clamped.confidence_score,

        confidence_was_clamped: clamped.confidence_was_clamped,

        source_trust_weight: trustWeight,

        publish_status: publishStatus,

        notes: appendNote(clamped.notes, valueTypeNote),

        verified_by: params.actor,

      })

      .select("entry_id, publish_status")

      .single();



    if (error || !inserted) {

      throw new Error(error?.message ?? "Could not save entry");

    }



    await supabase.from("verification_log").insert({

      entry_id: inserted.entry_id,

      action: "extracted",

      actor: params.actor,

      detail: `Saved ${entry.category}.${entry.field}`,

    });



    if (clamped.confidence_was_clamped) {

      await supabase.from("verification_log").insert({

        entry_id: inserted.entry_id,

        action: "confidence_clamped",

        actor: params.actor,

        detail: `Confidence capped from ${originalConfidence} to ${clamped.confidence_score} per registry.`,

      });

    }



    if (legalReview) {

      await supabase.from("verification_log").insert({

        entry_id: inserted.entry_id,

        action: "flagged_legal_review",

        actor: params.actor,

        detail: "Regulatory filing with sensitive retirement/risk compliance status.",

      });

    }

    if (valueTypeNote) {
      await supabase.from("verification_log").insert({
        entry_id: inserted.entry_id,
        action: "value_type_mismatch",
        actor: params.actor,
        detail: valueTypeNote,
      });
    }



    if (existing) {

      if (existing.publish_status !== "published" || publishStatus !== "published") {

        await supabase

          .from("benefit_entries")

          .update({

            publish_status: "superseded",

            superseded_by_entry_id: inserted.entry_id,

          })

          .eq("entry_id", existing.entry_id);

      } else {

        await supabase

          .from("benefit_entries")

          .update({ superseded_by_entry_id: inserted.entry_id })

          .eq("entry_id", existing.entry_id);

      }



      await supabase.from("verification_log").insert({

        entry_id: existing.entry_id,

        action: "corrected",

        actor: params.actor,

        detail: `Superseded by ${inserted.entry_id}`,

      });



      results.push({

        entry_id: inserted.entry_id,

        publish_status: inserted.publish_status as PublishStatus,

        action: valueTypeNote ? "value_type_mismatch" : "superseded_conflict",

        confidence_was_clamped: clamped.confidence_was_clamped,

        original_confidence: clamped.confidence_was_clamped ? originalConfidence : undefined,

      });

    } else {

      results.push({

        entry_id: inserted.entry_id,

        publish_status: inserted.publish_status as PublishStatus,

        action: valueTypeNote ? "value_type_mismatch" : "inserted",

        confidence_was_clamped: clamped.confidence_was_clamped,

        original_confidence: clamped.confidence_was_clamped ? originalConfidence : undefined,

      });

    }

  }



  return results;

}

