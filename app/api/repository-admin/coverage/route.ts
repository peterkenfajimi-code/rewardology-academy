import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function GET(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  const supabase = createRepositoryAdminClient();

  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .select("company_id, country, industry, company_size_band");

  if (companyError) {
    return NextResponse.json({ error: companyError.message }, { status: 500 });
  }

  const { data: entries, error: entryError } = await supabase
    .from("benefit_entries")
    .select("entry_id, company_id, publish_status")
    .neq("publish_status", "superseded");

  if (entryError) {
    return NextResponse.json({ error: entryError.message }, { status: 500 });
  }

  const entryCountByCompany = new Map<string, number>();
  for (const row of entries ?? []) {
    entryCountByCompany.set(row.company_id, (entryCountByCompany.get(row.company_id) ?? 0) + 1);
  }

  const bucket = new Map<
    string,
    { country: string; industry: string | null; company_size_band: string | null; company_count: number; entry_count: number }
  >();

  for (const company of companies ?? []) {
    const key = `${company.country}|${company.industry ?? ""}|${company.company_size_band ?? ""}`;
    const prev = bucket.get(key) ?? {
      country: company.country,
      industry: company.industry,
      company_size_band: company.company_size_band,
      company_count: 0,
      entry_count: 0,
    };
    prev.company_count += 1;
    prev.entry_count += entryCountByCompany.get(company.company_id) ?? 0;
    bucket.set(key, prev);
  }

  const rows = Array.from(bucket.values()).sort((a, b) =>
    a.country.localeCompare(b.country)
  );

  return NextResponse.json({
    summary: {
      companies: companies?.length ?? 0,
      activeEntries: entries?.length ?? 0,
    },
    rows,
  });
}
