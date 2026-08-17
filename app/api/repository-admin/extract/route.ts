import { NextResponse, type NextRequest } from "next/server";
import { isRepositoryAdminAuthed } from "@/lib/auth/repository-admin";
import { isAnthropicConfigured, isRepositorySupabaseConfigured } from "@/lib/env";
import {
  buildExtractionInstructions,
  buildExtractionPrompt,
} from "@/lib/repository/extraction-prompt";
import { fetchSourceDocument } from "@/lib/repository/fetch-source-document";
import { extractTextFromPdf } from "@/lib/repository/pdf-text";
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

async function callAnthropic(model: string, prompt: string): Promise<string> {
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
    throw new Error(detail);
  }

  const textBlock = payload.content?.find((c) => c.type === "text");
  if (!textBlock?.text) throw new Error("Empty model response");
  return textBlock.text;
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

  const model = process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

  try {
    let responseText: string;
    let sourceMode: "text" | "url-text" | "url-pdf-text" = "text";
    let pageCount: number | undefined;

    if (rawText) {
      responseText = await callAnthropic(
        model,
        buildExtractionPrompt(companyName, countryModule, rawText)
      );
    } else {
      const fetched = await fetchSourceDocument(sourceUrl);

      if (fetched.kind === "pdf") {
        const extracted = await extractTextFromPdf(fetched.buffer);
        pageCount = extracted.pageCount;
        sourceMode = "url-pdf-text";
        responseText = await callAnthropic(
          model,
          `${buildExtractionInstructions(companyName, countryModule)}

The following text was extracted from a ${pageCount}-page PDF annual report (benefits-related sections only):

${extracted.text}`
        );
      } else {
        sourceMode = "url-text";
        responseText = await callAnthropic(
          model,
          buildExtractionPrompt(companyName, countryModule, fetched.text)
        );
      }
    }

    const entries = parseExtractedJson(responseText);
    return NextResponse.json({ entries, sourceMode, pageCount });
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
