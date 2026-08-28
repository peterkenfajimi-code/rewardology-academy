import { NextResponse } from "next/server";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { findCompanyBySlug, loadPublicBenefitEntries } from "@/lib/repository/load-public-entries";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, context: RouteContext) {
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ configured: false, company: null, entries: [] });
  }

  const { slug } = await context.params;

  try {
    const { configured, entries } = await loadPublicBenefitEntries();
    const match = findCompanyBySlug(entries, slug);
    if (!match) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      configured,
      company: match.company,
      entries: match.entries,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to load company profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
