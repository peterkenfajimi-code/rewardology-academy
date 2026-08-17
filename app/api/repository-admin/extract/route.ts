import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isAnthropicConfigured, isRepositorySupabaseConfigured } from "@/lib/env";
import { extractBenefitsFromSource, parseExtractedJson } from "@/lib/repository/extract-benefits";
import type { CountryModule } from "@/lib/repository/types";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function POST(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  let body: { companyId?: string; companyName?: string; rawText?: string; sourceUrl?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawText = body.rawText?.trim() ?? "";
  const sourceUrl = body.sourceUrl?.trim() ?? "";

  if (!rawText && !sourceUrl) {
    return NextResponse.json(
      {
        error:
          "Paste source text or provide a Source URL (section 2) — large PDF annual reports are supported.",
      },
      { status: 400 }
    );
  }

  const supabase = createRepositoryAdminClient();
  let companyName = body.companyName?.trim() ?? "Unknown company";
  let countryModule: CountryModule | null = null;

  if (body.companyId) {
    const { data: company } = await supabase
      .from("companies")
      .select("name, country")
      .eq("company_id", body.companyId)
      .maybeSingle();

    if (company) {
      companyName = company.name;
      const { data: mod } = await supabase
        .from("country_modules")
        .select(
          "country_code, country_name, currency_code, pension_regulator, pension_statutory_employer_pct, pension_statutory_employee_pct, pension_scheme_type, notes"
        )
        .eq("country_code", company.country)
        .maybeSingle();
      countryModule = (mod as CountryModule | null) ?? null;
    }
  }

  try {
    const result = await extractBenefitsFromSource({
      companyName,
      countryModule,
      rawText: rawText || undefined,
      sourceUrl: rawText ? undefined : sourceUrl,
    });
    return NextResponse.json({
      entries: result.entries,
      sourceMode: result.sourceMode,
      pageCount: result.pageCount,
    });
  } catch (e) {
    if (e instanceof SyntaxError || (e instanceof Error && e.message.includes("JSON"))) {
      return NextResponse.json(
        { error: "Could not parse model response as JSON" },
        { status: 422 }
      );
    }
    const message = e instanceof Error ? e.message : "Extraction failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export { parseExtractedJson };
