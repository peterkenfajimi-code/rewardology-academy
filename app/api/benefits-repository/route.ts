import { NextResponse } from "next/server";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { createRepositoryReadClient } from "@/lib/supabase/repository/admin";

export async function GET(req: Request) {
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const industry = url.searchParams.get("industry");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  const supabase = createRepositoryReadClient();
  if (!supabase) {
    return NextResponse.json({ configured: false, entries: [] });
  }

  let query = supabase
    .from("benefit_entries")
    .select(
      `
      entry_id, category, field, value, value_type, confidence_score, fiscal_year_or_effective_date,
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

  let entries = data ?? [];
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
  if (q) {
    entries = entries.filter((row) => {
      const company = row.companies as { name?: string; industry?: string | null };
      const hay = [company.name, company.industry, row.field, row.value, row.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }

  return NextResponse.json({ configured: true, entries });
}
