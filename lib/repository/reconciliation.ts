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

export type ExistingEntry = {
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
  superseded_published?: { entry_id: string; previous_value: string | null }[];
};

export type PublishedSupersedePreview = {
  category: string;
  field: string;
  fieldLabel: string;
  existingEntryId: string;
  existingValue: string | null;
  incomingValue: string | null;
};

function normalizeValue(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function appendNote(notes: string | null | undefined, extra: string | null): string | null {
  if (!extra) return notes ?? null;
  return notes?.trim() ? `${notes.trim()} ${extra}` : extra;
}

/** Incoming beats an existing row on trust, then confidence. Ties do not win. */
export function incomingBeatsExisting(
  incomingTrust: number,
  incomingConfidence: ConfidenceScore,
  existing: Pick<ExistingEntry, "source_trust_weight" | "confidence_score">
): boolean {
  const oldWeight = existing.source_trust_weight ?? 0;
  return (
    incomingTrust > oldWeight ||
    (incomingTrust === oldWeight &&
      compareConfidence(incomingConfidence, existing.confidence_score) > 0)
  );
}

/** Strongest active row: trust, then confidence, then published over pending. */
export function pickBestExisting(rows: ExistingEntry[]): ExistingEntry | null {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => {
    const trust = (b.source_trust_weight ?? 0) - (a.source_trust_weight ?? 0);
    if (trust !== 0) return trust;
    const conf = compareConfidence(b.confidence_score, a.confidence_score);
    if (conf !== 0) return conf;
    if (a.publish_status === "published" && b.publish_status !== "published") return -1;
    if (b.publish_status === "published" && a.publish_status !== "published") return 1;
    return 0;
  })[0];
}

/**
 * Rows to mark `superseded` once a winning incoming entry is saved.
 *
 * Decision: do not add a fifth publish_status. Historical duplicates — pending
 * rows permanently outranked by a newer, higher-trust source — use existing
 * `superseded`. `pending_verification` stays for rows that still need a human
 * decision (lower-trust conflicts that did not win).
 *
 * Publishing replaces every active row for the field (unique published fact).
 * Saving as pending only retires other pending rows; the live published fact
 * stays up until a reviewer confirms the replacement.
 */
export function historicalDuplicateIds(
  existingList: ExistingEntry[],
  incomingWillPublish: boolean
): string[] {
  if (incomingWillPublish) return existingList.map((row) => row.entry_id);
  return existingList
    .filter((row) => row.publish_status === "pending_verification")
    .map((row) => row.entry_id);
}

const ACTIVE_STATUSES: PublishStatus[] = ["published", "pending_verification"];

async function loadActiveEntries(
  supabase: SupabaseClient,
  companyId: string,
  category: string,
  field: string
): Promise<ExistingEntry[]> {
  const { data } = await supabase
    .from("benefit_entries")
    .select("entry_id, value, source_trust_weight, confidence_score, date_collected, publish_status")
    .eq("company_id", companyId)
    .eq("category", category)
    .eq("field", field)
    .in("publish_status", ACTIVE_STATUSES);

  return (data ?? []) as ExistingEntry[];
}

type PreparedIncoming = {
  originalConfidence: ConfidenceScore;
  clamped: ReturnType<typeof clampConfidenceToRegistry>;
  entryValue: string | null;
  valueTypeNote: string | null;
  legalReview: boolean;
  publishStatus: PublishStatus;
};

function prepareIncoming(
  entry: SaveEntryInput,
  registryRow: { max_confidence: ConfidenceScore; value_type: string },
  sourceType: SourceType
): PreparedIncoming {
  const originalConfidence = entry.confidence_score;
  const clamped = clampConfidenceToRegistry(
    entry.confidence_score,
    registryRow.max_confidence,
    entry.notes
  );
  const entryValue = normalizeComplianceStatusValue(entry.field, entry.value, entry.value_type);
  const valueTypeCheck = validateExtractedValueType(
    registryRow.value_type,
    entry.value_type,
    entry.field,
    entryValue
  );
  const valueTypeNote = valueTypeCheck.matches ? null : valueTypeCheck.reason;
  const legalReview = requiresLegalReview(
    entry.category,
    sourceType,
    entry.value,
    entry.value_type
  );

  let publishStatus: PublishStatus = entry.publish ? "published" : "pending_verification";
  if (valueTypeNote) publishStatus = "pending_verification";
  if (legalReview) publishStatus = "pending_verification";
  if (clamped.confidence_score === "low") publishStatus = "pending_verification";

  return { originalConfidence, clamped, entryValue, valueTypeNote, legalReview, publishStatus };
}

export async function previewPublishedSupersedes(
  supabase: SupabaseClient,
  params: {
    companyId: string;
    sourceType: SourceType;
    entries: SaveEntryInput[];
  }
): Promise<PublishedSupersedePreview[]> {
  const previews: PublishedSupersedePreview[] = [];
  const trustWeight = trustWeightForSourceType(params.sourceType);
  const registryRows = await loadFieldRegistry(supabase);
  const registryByKey = indexRegistry(registryRows);

  for (const entry of params.entries) {
    if (isUnmappedField(entry.field) || isExcludedBenefitField(entry.field)) continue;
    const registryRow = registryByKey.get(`${entry.category}::${entry.field}`);
    if (!registryRow) continue;

    const prepared = prepareIncoming(entry, registryRow, params.sourceType);
    if (prepared.publishStatus !== "published") continue;

    const existingList = await loadActiveEntries(
      supabase,
      params.companyId,
      entry.category,
      entry.field
    );
    const duplicate = existingList.find(
      (row) => normalizeValue(row.value) === normalizeValue(prepared.entryValue)
    );
    if (duplicate) continue;

    const publishedExisting = existingList.find((row) => row.publish_status === "published");
    if (!publishedExisting) continue;
    if (!incomingBeatsExisting(trustWeight, prepared.clamped.confidence_score, publishedExisting)) {
      continue;
    }

    previews.push({
      category: entry.category,
      field: entry.field,
      fieldLabel: registryRow.field_label,
      existingEntryId: publishedExisting.entry_id,
      existingValue: publishedExisting.value,
      incomingValue: prepared.entryValue,
    });
  }

  return previews;
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

    const prepared = prepareIncoming(entry, registryRow, params.sourceType);
    const { originalConfidence, clamped, entryValue, valueTypeNote, legalReview, publishStatus } =
      prepared;

    const existingList = await loadActiveEntries(
      supabase,
      params.companyId,
      entry.category,
      entry.field
    );

    const duplicate = existingList.find(
      (row) => normalizeValue(row.value) === normalizeValue(entryValue)
    );
    if (duplicate) {
      results.push({
        entry_id: duplicate.entry_id,
        publish_status: duplicate.publish_status,
        action: "duplicate",
      });
      continue;
    }

    const bestExisting = pickBestExisting(existingList);
    const newWins =
      !bestExisting ||
      incomingBeatsExisting(trustWeight, clamped.confidence_score, bestExisting);

    if (bestExisting && !newWins) {
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
        detail: `Lower-trust incoming entry for ${entry.field} (trust ${trustWeight}) conflicts with existing ${bestExisting.publish_status} entry (trust ${bestExisting.source_trust_weight ?? 0}) — held for review.`,
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

    const incomingWillPublish = publishStatus === "published";
    const publishedExisting = existingList.filter((row) => row.publish_status === "published");

    if (incomingWillPublish && publishedExisting.length) {
      await supabase
        .from("benefit_entries")
        .update({ publish_status: "superseded" })
        .in(
          "entry_id",
          publishedExisting.map((row) => row.entry_id)
        );
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

    const idsToSupersede = historicalDuplicateIds(existingList, incomingWillPublish);
    const supersededPublished = incomingWillPublish
      ? publishedExisting.map((row) => ({
          entry_id: row.entry_id,
          previous_value: row.value,
        }))
      : [];

    if (idsToSupersede.length) {
      await supabase
        .from("benefit_entries")
        .update({
          publish_status: "superseded",
          superseded_by_entry_id: inserted.entry_id,
        })
        .in("entry_id", idsToSupersede);

      await supabase.from("verification_log").insert(
        idsToSupersede.map((entryId) => ({
          entry_id: entryId,
          action: "superseded",
          actor: params.actor,
          detail: `Superseded by ${inserted.entry_id}`,
        }))
      );
    }

    results.push({
      entry_id: inserted.entry_id,
      publish_status: inserted.publish_status as PublishStatus,
      action: valueTypeNote
        ? "value_type_mismatch"
        : idsToSupersede.length
          ? "superseded_conflict"
          : "inserted",
      confidence_was_clamped: clamped.confidence_was_clamped,
      original_confidence: clamped.confidence_was_clamped ? originalConfidence : undefined,
      superseded_published: supersededPublished.length ? supersededPublished : undefined,
    });
  }

  return results;
}
