import { NextResponse } from "next/server";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { buildCompanyIndex, loadPublicBenefitEntries } from "@/lib/repository/load-public-entries";

export async function GET(req: Request) {
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ configured: false, companies: [], stats: null });
  }

  const url = new URL(req.url);
  const country = url.searchParams.get("country");
  const industry = url.searchParams.get("industry");
  const category = url.searchParams.get("category");
  const confidence = url.searchParams.get("confidence");
  const q = url.searchParams.get("q")?.trim().toLowerCase();

  try {
    const { configured, entries, stats } = await loadPublicBenefitEntries();
    const allCompanies = buildCompanyIndex(entries);
    const industries = Array.from(
      new Set(allCompanies.map((c) => c.industry).filter(Boolean) as string[])
    ).sort();

    let companies = allCompanies;

    if (country) {
      companies = companies.filter((c) => c.country === country);
    }
    if (industry) {
      companies = companies.filter((c) => c.industry === industry);
    }
    if (category) {
      companies = companies.filter((c) => c.categories.includes(category));
    }
    if (confidence) {
      companies = companies.filter((c) => {
        const companyEntries = entries.filter((e) => e.company_id === c.company_id);
        return companyEntries.some((e) => e.confidence_score === confidence);
      });
    }
    if (q) {
      companies = companies.filter((c) => {
        const companyEntries = entries.filter((e) => e.company_id === c.company_id);
        const hay = [
          c.name,
          c.industry,
          c.country,
          ...companyEntries.flatMap((e) => [e.field, e.field_label, e.display_text, e.value]),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }

    return NextResponse.json({
      configured,
      companies,
      industries,
      stats: {
        ...stats,
        companies_total: allCompanies.length,
        companies_visible: companies.length,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load repository";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
