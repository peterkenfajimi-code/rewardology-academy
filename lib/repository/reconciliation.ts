import type { SupabaseClient } from "@supabase/supabase-js";
import { requiresLegalReview } from "@/lib/repository/legal-review";
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
  action: "inserted" | "superseded_conflict" | "kept_existing" | "duplicate";
};

function normalizeValue(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
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

  for (const entry of params.entries) {
    const { data: existingRows } = await supabase
      .from("benefit_entries")
      .select("entry_id, value, source_trust_weight, confidence_score, date_collected, publish_status")
      .eq("company_id", params.companyId)
      .eq("category", entry.category)
      .eq("field", entry.field)
      .in("publish_status", ["published", "pending_verification"]);

    const existing = (existingRows?.[0] as ExistingEntry | undefined) ?? null;

    if (existing && normalizeValue(existing.value) === normalizeValue(entry.value)) {
      results.push({
        entry_id: existing.entry_id,
        publish_status: existing.publish_status,
        action: "duplicate",
      });
      continue;
    }

    let publishStatus: PublishStatus = entry.publish ? "published" : "pending_verification";
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
          compareConfidence(entry.confidence_score, existing.confidence_score) > 0);

      if (!newWins) {
        results.push({
          entry_id: existing.entry_id,
          publish_status: existing.publish_status,
          action: "kept_existing",
        });
        await supabase.from("verification_log").insert({
          entry_id: existing.entry_id,
          action: "reconciled",
          actor: params.actor,
          detail: `Incoming entry for ${entry.field} rejected — existing source trust ${oldWeight} >= ${trustWeight}.`,
        });
        continue;
      }
    }

    const { data: inserted, error } = await supabase
      .from("benefit_entries")
      .insert({
        company_id: params.companyId,
        source_id: params.sourceId,
        category: entry.category,
        field: entry.field,
        value: entry.value,
        value_type: entry.value_type,
        fiscal_year_or_effective_date: entry.fiscal_year_or_effective_date ?? null,
        confidence_score: entry.confidence_score,
        source_trust_weight: trustWeight,
        publish_status: publishStatus,
        notes: entry.notes ?? null,
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

    if (legalReview) {
      await supabase.from("verification_log").insert({
        entry_id: inserted.entry_id,
        action: "flagged_legal_review",
        actor: params.actor,
        detail: "Regulatory filing with sensitive retirement/risk compliance status.",
      });
    }

    if (existing) {
      await supabase
        .from("benefit_entries")
        .update({
          publish_status: "superseded",
          superseded_by_entry_id: inserted.entry_id,
        })
        .eq("entry_id", existing.entry_id);

      await supabase.from("verification_log").insert({
        entry_id: existing.entry_id,
        action: "superseded",
        actor: params.actor,
        detail: `Superseded by ${inserted.entry_id}`,
      });

      results.push({
        entry_id: inserted.entry_id,
        publish_status: inserted.publish_status as PublishStatus,
        action: "superseded_conflict",
      });
    } else {
      results.push({
        entry_id: inserted.entry_id,
        publish_status: inserted.publish_status as PublishStatus,
        action: "inserted",
      });
    }
  }

  return results;
}
