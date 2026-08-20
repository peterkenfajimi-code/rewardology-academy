import type { SupabaseClient } from "@supabase/supabase-js";
import { sanitizeBenefitEntriesForSave } from "@/lib/repository/collection-policy";
import { saveEntriesWithReconciliation } from "@/lib/repository/reconciliation";
import { saveWorkforceCompositionEntries } from "@/lib/repository/save-workforce";
import type { ExtractedWorkforceEntry } from "@/lib/repository/workforce-metrics";
import type { CountryCode, ExtractedEntry, SourceType } from "@/lib/repository/types";

export type SourceInput = {
  source_type: SourceType;
  source_url?: string | null;
  source_title?: string | null;
  publication_date?: string | null;
  date_accessed?: string;
  country?: CountryCode | null;
};

export type SaveSourceResult = {
  sourceId: string;
  skipped: boolean;
  results: Awaited<ReturnType<typeof saveEntriesWithReconciliation>>;
  workforceResults: Awaited<ReturnType<typeof saveWorkforceCompositionEntries>>;
};

export async function findExistingSourceByUrl(
  supabase: SupabaseClient,
  companyId: string,
  sourceUrl: string
): Promise<{ source_id: string } | null> {
  const normalized = sourceUrl.trim();
  if (!normalized) return null;

  const { data } = await supabase
    .from("sources")
    .select("source_id")
    .eq("company_id", companyId)
    .eq("source_url", normalized)
    .maybeSingle();

  return data ?? null;
}

export async function saveSourceAndEntries(
  supabase: SupabaseClient,
  params: {
    companyId: string;
    source: SourceInput;
    entries: ExtractedEntry[];
    workforceComposition?: ExtractedWorkforceEntry[];
    publish?: boolean;
    actor?: string;
    skipIfUrlExists?: boolean;
  }
): Promise<SaveSourceResult> {
  const actor = params.actor?.trim() || "repository-admin";
  const url = params.source.source_url?.trim() ?? "";
  const sanitized = sanitizeBenefitEntriesForSave(params.entries);
  const benefitEntries = sanitized.benefits;
  const workforceEntries = [...(params.workforceComposition ?? []), ...sanitized.reroutedWorkforce];

  if (!params.source.source_type) {
    throw new Error("source_type is required");
  }
  if (!benefitEntries.length && !workforceEntries.length) {
    throw new Error("At least one benefit or workforce entry is required");
  }
  if (!url && !params.source.source_title?.trim()) {
    throw new Error("Source URL or title is required");
  }

  if (params.skipIfUrlExists && url) {
    const existing = await findExistingSourceByUrl(supabase, params.companyId, url);
    if (existing) {
      return { sourceId: existing.source_id, skipped: true, results: [], workforceResults: [] };
    }
  }

  const { data: source, error: sourceError } = await supabase
    .from("sources")
    .insert({
      company_id: params.companyId,
      source_type: params.source.source_type,
      source_url: url || null,
      source_title: params.source.source_title?.trim() || null,
      publication_date: params.source.publication_date || null,
      date_accessed: params.source.date_accessed || new Date().toISOString().slice(0, 10),
      country: params.source.country || null,
    })
    .select("source_id")
    .single();

  if (sourceError || !source) {
    if (sourceError?.code === "23505" && url) {
      const existing = await findExistingSourceByUrl(supabase, params.companyId, url);
      if (existing) {
        return { sourceId: existing.source_id, skipped: true, results: [], workforceResults: [] };
      }
    }
    throw new Error(sourceError?.message ?? "Could not save source");
  }

  const results = benefitEntries.length
    ? await saveEntriesWithReconciliation(supabase, {
        companyId: params.companyId,
        sourceId: source.source_id,
        sourceType: params.source.source_type,
        actor,
        entries: benefitEntries.map((e) => ({ ...e, publish: params.publish })),
      })
    : [];

  const workforceResults = workforceEntries.length
    ? await saveWorkforceCompositionEntries(supabase, {
        companyId: params.companyId,
        sourceId: source.source_id,
        actor,
        entries: workforceEntries,
        publish: params.publish,
      })
    : [];

  await supabase
    .from("companies")
    .update({ last_reviewed_at: new Date().toISOString() })
    .eq("company_id", params.companyId);

  return { sourceId: source.source_id, skipped: false, results, workforceResults };
}
