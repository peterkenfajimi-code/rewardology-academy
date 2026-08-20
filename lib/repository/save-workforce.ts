import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExtractedWorkforceEntry } from "@/lib/repository/workforce-metrics";

export type SaveWorkforceResult = {
  entry_id: string;
  metric_key: string;
  action: "inserted" | "duplicate";
};

export async function saveWorkforceCompositionEntries(
  supabase: SupabaseClient,
  params: {
    companyId: string;
    sourceId: string;
    actor: string;
    entries: ExtractedWorkforceEntry[];
    publish?: boolean;
  }
): Promise<SaveWorkforceResult[]> {
  const results: SaveWorkforceResult[] = [];
  const publishStatus = params.publish ? "published" : "pending_verification";

  for (const entry of params.entries) {
    const { data: existing } = await supabase
      .from("workforce_composition_entries")
      .select("entry_id, value")
      .eq("company_id", params.companyId)
      .eq("metric_key", entry.metric_key)
      .eq("publish_status", "published")
      .maybeSingle();

    if (existing && existing.value.trim() === entry.value.trim()) {
      results.push({ entry_id: existing.entry_id, metric_key: entry.metric_key, action: "duplicate" });
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("workforce_composition_entries")
      .insert({
        company_id: params.companyId,
        source_id: params.sourceId,
        metric_key: entry.metric_key,
        value: entry.value,
        reporting_period: entry.reporting_period ?? null,
        confidence_score: entry.confidence_score,
        publish_status: publishStatus,
        notes: entry.notes ?? null,
      })
      .select("entry_id")
      .single();

    if (error || !inserted) {
      throw new Error(error?.message ?? `Could not save workforce metric ${entry.metric_key}`);
    }

    results.push({ entry_id: inserted.entry_id, metric_key: entry.metric_key, action: "inserted" });
  }

  return results;
}
