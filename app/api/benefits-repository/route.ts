import { NextResponse } from "next/server";
import {
  isEntryWithinRecencyWindow,
  isExcludedBenefitField,
} from "@/lib/repository/collection-policy";
import { indexRegistry, loadFieldRegistry, renderDisplayText } from "@/lib/repository/field-registry";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { createRepositoryReadClient } from "@/lib/supabase/repository/admin";

export async function GET(req: Request) {
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const industry = url.searchParams.get("industry");
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  const supabase = createRepositoryReadClient();
  if (!supabase) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const registryRows = await loadFieldRegistry(supabase).catch(() => []);
  const registryByKey = indexRegistry(registryRows);

  let query = supabase
    .from("benefit_entries")
    .select(
      `
      entry_id, category, field, value, value_type, confidence_score, confidence_was_clamped,
      fiscal_year_or_effective_date, effective_date,
      companies!inner ( company_id, name, country, industry ),
      sources!inner ( source_type, source_title, source_url, publication_date )
    `
    )
    .eq("publish_status", "published")
    .order("date_collected", { ascending: false })
    .limit(200);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let entries = (data ?? []).map((row) => {
    const company = row.companies as { name: string; country?: string; industry?: string | null };
    const registry = registryByKey.get(`${row.category}::${row.field}`);
    const displayText = renderDisplayText(
      registry?.display_template,
      company.name,
      row.value,
      registry?.field_label
    );

    return {
      ...row,
      field_label: registry?.field_label ?? null,
      display_text: displayText,
    };
  });

  entries = entries.filter((row) => {
    if (isExcludedBenefitField(row.field)) return false;
    const source = row.sources as {
      publication_date?: string | null;
      source_url?: string | null;
      source_title?: string | null;
    };
    return isEntryWithinRecencyWindow(
      { fiscal_year_or_effective_date: row.fiscal_year_or_effective_date },
      source
    );
  });

  if (country) {
    entries = entries.filter((row) => {
      const company = row.companies as { country?: string };
      return company.country === country;
    });
  }
  if (industry) {
    entries = entries.filter((row) => {
      const company = row.companies as { industry?: string | null };
      return company.industry === industry;
    });
  }
  if (category) {
    entries = entries.filter((row) => row.category === category);
  }
  if (q) {
    entries = entries.filter((row) => {
      const company = row.companies as { name?: string; industry?: string | null };
      const hay = [
        company.name,
        company.industry,
        row.field,
        row.field_label,
        row.display_text,
        row.value,
        row.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return NextResponse.json({
    configured: true,
    entries,
    stats: {
      published_visible: entries.length,
      published_total: (data ?? []).filter((row) => !isExcludedBenefitField(row.field)).length,
      excluded_by_recency: (data ?? []).filter((row) => {
        if (isExcludedBenefitField(row.field)) return false;
        const source = row.sources as {
          publication_date?: string | null;
          source_url?: string | null;
          source_title?: string | null;
        };
        return !isEntryWithinRecencyWindow(
          { fiscal_year_or_effective_date: row.fiscal_year_or_effective_date },
          source
        );
      }).length,
    },
  });
}
