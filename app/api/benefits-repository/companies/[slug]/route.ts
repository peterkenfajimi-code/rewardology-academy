import { NextResponse } from "next/server";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { computeConfidenceMix } from "@/lib/repository/confidence-mix";
import {
  findCompanyBySlug,
  loadPublicBenefitEntries,
  loadPublicWorkforceEntries,
} from "@/lib/repository/load-public-entries";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, context: RouteContext) {
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ configured: false, company: null, entries: [], workforce: [] });
  }

  const { slug } = await context.params;

  try {
    const [{ configured, entries }, workforceAll] = await Promise.all([
      loadPublicBenefitEntries(),
      loadPublicWorkforceEntries(),
    ]);
    const match = findCompanyBySlug(entries, slug);
    if (!match) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const workforce = workforceAll.filter((row) => row.company_id === match.company.company_id);
    const scores = [...match.entries, ...workforce].map((row) => row.confidence_score);

    return NextResponse.json({
      configured,
      company: {
        ...match.company,
        field_count: match.entries.length + workforce.length,
        confidence_mix: computeConfidenceMix(scores),
      },
      entries: match.entries,
      workforce,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load company profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
