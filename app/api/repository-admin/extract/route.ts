import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isAnthropicConfigured, isRepositorySupabaseConfigured } from "@/lib/env";
import { buildExtractionPrompt } from "@/lib/repository/extraction-prompt";
import type { CountryModule, ExtractedEntry } from "@/lib/repository/types";
import { createRepositoryAdminClient } from "@/lib/supabase/repository/admin";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function parseExtractedJson(text: string): ExtractedEntry[] {
  const trimmed = text.trim();
  const jsonText = trimmed.startsWith("[")
    ? trimmed
    : trimmed.slice(trimmed.indexOf("["), trimmed.lastIndexOf("]") + 1);

  const parsed = JSON.parse(jsonText) as ExtractedEntry[];
  if (!Array.isArray(parsed)) throw new Error("Expected JSON array");
  return parsed;
}

export async function POST(req: NextRequest) {
  if (!isRepositoryAdminAuthed(req)) return unauthorized();
  if (!isAnthropicConfigured()) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 503 });
  }
  if (!isRepositorySupabaseConfigured()) {
    return NextResponse.json({ error: "Repository database not configured" }, { status: 503 });
  }

  let body: { companyId?: string; companyName?: string; rawText?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawText = body.rawText?.trim();
  if (!rawText) {
    return NextResponse.json({ error: "rawText is required" }, { status: 400 });
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

  const prompt = buildExtractionPrompt(companyName, countryModule, rawText);

  const model =
    process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const payload = (await res.json()) as {
    error?: { type?: string; message?: string };
    content?: { type: string; text?: string }[];
  };

  if (!res.ok) {
    const detail = payload.error?.message ?? payload.error?.type ?? "Anthropic API error";
    return NextResponse.json({ error: detail }, { status: 502 });
  }

  const textBlock = payload.content?.find((c) => c.type === "text");
  if (!textBlock?.text) {
    return NextResponse.json({ error: "Empty model response" }, { status: 502 });
  }

  try {
    const entries = parseExtractedJson(textBlock.text);
    return NextResponse.json({ entries });
  } catch (e) {
    return NextResponse.json(
      {
        error: "Could not parse model JSON",
        raw: textBlock.text.slice(0, 2000),
        detail: e instanceof Error ? e.message : "Parse error",
      },
      { status: 422 }
    );
  }
}
