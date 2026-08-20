import {

  buildExtractionInstructions,

  buildExtractionPrompt,

} from "@/lib/repository/extraction-prompt";

import { filterExtractedEntries, sanitizeBenefitEntriesForSave } from "@/lib/repository/collection-policy";
import { normalizeComplianceStatusValue } from "@/lib/repository/compliance-status";

import { fetchSourceDocument } from "@/lib/repository/fetch-source-document";

import { extractTextFromPdf } from "@/lib/repository/pdf-text";

import type { FieldRegistryRow } from "@/lib/repository/field-registry";

import type { ExtractedWorkforceEntry } from "@/lib/repository/workforce-metrics";

import type { CountryModule, ExtractedEntry, ExtractionPayload } from "@/lib/repository/types";



export type ExtractSourceMode = "text" | "url-text" | "url-pdf-text";



export type ExtractBenefitsResult = {

  entries: ExtractedEntry[];

  workforceComposition: ExtractedWorkforceEntry[];

  sourceMode: ExtractSourceMode;

  pageCount?: number;

};



function extractJsonBlock(text: string): string {
  const trimmed = text.trim();
  const objStart = trimmed.indexOf("{");
  const arrStart = trimmed.indexOf("[");

  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) {
    let depth = 0;
    for (let i = objStart; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === "{") depth++;
      else if (ch === "}") {
        depth--;
        if (depth === 0) return trimmed.slice(objStart, i + 1);
      }
    }
  }

  if (arrStart !== -1) {
    let depth = 0;
    for (let i = arrStart; i < trimmed.length; i++) {
      const ch = trimmed[i];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) return trimmed.slice(arrStart, i + 1);
      }
    }
  }

  throw new Error("Could not locate JSON object or array in model response");
}

export function parseExtractionPayload(text: string): ExtractionPayload {
  const parsed = JSON.parse(extractJsonBlock(text)) as unknown;



  if (Array.isArray(parsed)) {

    return { benefits: parsed as ExtractedEntry[], workforce_composition: [] };

  }



  const obj = parsed as Partial<ExtractionPayload>;

  return {

    benefits: Array.isArray(obj.benefits) ? obj.benefits : [],

    workforce_composition: Array.isArray(obj.workforce_composition) ? obj.workforce_composition : [],

  };

}



/** @deprecated use parseExtractionPayload — returns benefits array only for legacy callers */

export function parseExtractedJson(text: string): ExtractedEntry[] {

  return parseExtractionPayload(text).benefits;

}



function normalizePayload(payload: ExtractionPayload): ExtractBenefitsResult["entries"] {
  const sanitized = sanitizeBenefitEntriesForSave(filterExtractedEntries(payload.benefits));
  return sanitized.benefits.map((e) => ({
    ...e,
    value: normalizeComplianceStatusValue(e.field, e.value, e.value_type),
  }));
}



function normalizeWorkforce(payload: ExtractionPayload): ExtractedWorkforceEntry[] {

  const sanitized = sanitizeBenefitEntriesForSave(filterExtractedEntries(payload.benefits));

  return [...payload.workforce_composition, ...sanitized.reroutedWorkforce];

}



export async function callAnthropicExtraction(model: string, prompt: string): Promise<string> {

  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured");



  const res = await fetch("https://api.anthropic.com/v1/messages", {

    method: "POST",

    headers: {

      "Content-Type": "application/json",

      "x-api-key": apiKey,

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



export function anthropicModelId(): string {

  return process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-5-20250929";

}



function buildResult(

  payload: ExtractionPayload,

  sourceMode: ExtractSourceMode,

  pageCount?: number

): ExtractBenefitsResult {

  return {

    entries: normalizePayload(payload),

    workforceComposition: normalizeWorkforce(payload),

    sourceMode,

    pageCount,

  };

}



export async function extractBenefitsFromSource(params: {

  companyName: string;

  countryModule?: CountryModule | null;

  registryRows?: FieldRegistryRow[];

  rawText?: string;

  sourceUrl?: string;

}): Promise<ExtractBenefitsResult> {

  const registryRows = params.registryRows ?? [];

  const rawText = params.rawText?.trim() ?? "";

  const sourceUrl = params.sourceUrl?.trim() ?? "";



  if (!rawText && !sourceUrl) {

    throw new Error("Provide rawText or sourceUrl for extraction");

  }



  const model = anthropicModelId();



  if (rawText) {

    const responseText = await callAnthropicExtraction(

      model,

      buildExtractionPrompt(params.companyName, params.countryModule ?? null, rawText, registryRows)

    );

    return buildResult(parseExtractionPayload(responseText), "text");

  }



  const fetched = await fetchSourceDocument(sourceUrl);



  if (fetched.kind === "pdf") {

    const extracted = await extractTextFromPdf(fetched.buffer);

    const responseText = await callAnthropicExtraction(

      model,

      `${buildExtractionInstructions(params.companyName, params.countryModule ?? null, registryRows)}



The following text was extracted from a ${extracted.pageCount}-page PDF (benefits-related sections only):



${extracted.text}`

    );

    return buildResult(parseExtractionPayload(responseText), "url-pdf-text", extracted.pageCount);

  }



  const responseText = await callAnthropicExtraction(

    model,

    buildExtractionPrompt(params.companyName, params.countryModule ?? null, fetched.text, registryRows)

  );

  return buildResult(parseExtractionPayload(responseText), "url-text");

}


