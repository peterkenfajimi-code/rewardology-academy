import type { SupabaseClient } from "@supabase/supabase-js";
import { loadDisclosureCompanies } from "@/lib/repository/disclosure-companies";
import { extractBenefitsFromSource } from "@/lib/repository/extract-benefits";
import { saveSourceAndEntries } from "@/lib/repository/save-source";
import {
  discoverSourcesForCompany,
  filterSourcesByTypes,
  type DiscoveredSource,
  type DisclosureCompany,
} from "@/lib/repository/source-discovery";
import type { CountryModule, DisclosureExchange, SourceType } from "@/lib/repository/types";

export type BatchConfig = {
  maxCompanies?: number;
  tickers?: string[];
  exchanges?: DisclosureExchange[];
  sourceTypes?: SourceType[];
  publish?: boolean;
  dryRun?: boolean;
  delayMs?: number;
  skipExistingSources?: boolean;
  actor?: string;
};

export type BatchProgress = {
  companiesTotal: number;
  companiesDone: number;
  sourcesDiscovered: number;
  sourcesProcessed: number;
  sourcesSkipped: number;
  entriesSaved: number;
  errors: number;
  currentCompany?: string;
  currentSource?: string;
};

export type BatchRunResult = {
  progress: BatchProgress;
  log: string;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function appendLog(log: string[], line: string) {
  log.push(`[${new Date().toISOString()}] ${line}`);
}

async function upsertDisclosureCompany(
  supabase: SupabaseClient,
  entry: DisclosureCompany
): Promise<{ company_id: string; name: string; country: string }> {
  let byTickerQuery = supabase
    .from("companies")
    .select("company_id, name, country")
    .eq("exchange_ticker", entry.ticker);

  if (entry.exchange) {
    byTickerQuery = byTickerQuery.eq("listing_exchange", entry.exchange);
  }

  const { data: byTicker } = await byTickerQuery.maybeSingle();
  if (byTicker) return byTicker;

  const { data: byName } = await supabase
    .from("companies")
    .select("company_id, name, country")
    .ilike("name", entry.name)
    .maybeSingle();

  if (byName) {
    await supabase
      .from("companies")
      .update({
        exchange_ticker: entry.ticker,
        listed_status: "listed",
        listing_exchange: entry.exchange,
        industry: entry.sector ?? null,
      })
      .eq("company_id", byName.company_id);
    return byName;
  }

  const { data: inserted, error } = await supabase
    .from("companies")
    .insert({
      name: entry.name,
      country: "NG",
      industry: entry.sector ?? null,
      listed_status: "listed",
      exchange_ticker: entry.ticker,
      listing_exchange: entry.exchange,
      last_reviewed_at: new Date().toISOString(),
    })
    .select("company_id, name, country")
    .single();

  if (error || !inserted) {
    throw new Error(error?.message ?? `Could not create company ${entry.name}`);
  }

  return inserted;
}

async function loadCountryModule(
  supabase: SupabaseClient,
  countryCode: string
): Promise<CountryModule | null> {
  const { data } = await supabase
    .from("country_modules")
    .select(
      "country_code, country_name, currency_code, pension_regulator, pension_statutory_employer_pct, pension_statutory_employee_pct, pension_scheme_type, notes"
    )
    .eq("country_code", countryCode)
    .maybeSingle();
  return (data as CountryModule | null) ?? null;
}

async function processSource(
  supabase: SupabaseClient,
  params: {
    companyId: string;
    companyName: string;
    countryModule: CountryModule | null;
    source: DiscoveredSource;
    config: BatchConfig;
    progress: BatchProgress;
    log: string[];
  }
) {
  const { config, progress, log, source } = params;
  progress.currentSource = `${source.source_type}: ${source.source_url}`;

  if (config.dryRun) {
    appendLog(log, `DRY RUN would process ${params.companyName} → ${source.source_type} ${source.source_url}`);
    progress.sourcesProcessed += 1;
    return;
  }

  try {
    const extracted = await extractBenefitsFromSource({
      companyName: params.companyName,
      countryModule: params.countryModule,
      sourceUrl: source.source_url,
    });

    if (!extracted.entries.length) {
      appendLog(log, `No entries extracted for ${params.companyName} — ${source.source_type}`);
      progress.sourcesProcessed += 1;
      return;
    }

    const saved = await saveSourceAndEntries(supabase, {
      companyId: params.companyId,
      source: {
        source_type: source.source_type,
        source_url: source.source_url,
        source_title: source.source_title,
        publication_date: source.publication_date ?? null,
        country: "NG",
      },
      entries: extracted.entries,
      publish: config.publish ?? false,
      actor: config.actor ?? "batch-runner",
      skipIfUrlExists: config.skipExistingSources ?? true,
    });

    progress.sourcesProcessed += 1;
    if (saved.skipped) {
      progress.sourcesSkipped += 1;
      appendLog(log, `Skipped existing source URL for ${params.companyName} — ${source.source_type}`);
      return;
    }

    const inserted = saved.results.filter((r) => r.action === "inserted" || r.action === "superseded_conflict").length;
    progress.entriesSaved += inserted;
    appendLog(
      log,
      `Saved ${inserted} entries for ${params.companyName} — ${source.source_type} (${extracted.sourceMode})`
    );
  } catch (e) {
    progress.errors += 1;
    progress.sourcesProcessed += 1;
    const message = e instanceof Error ? e.message : "Unknown error";
    appendLog(log, `ERROR ${params.companyName} — ${source.source_type}: ${message}`);
  }
}

export async function runBenefitsRepositoryBatch(
  supabase: SupabaseClient,
  config: BatchConfig = {},
  onProgress?: (progress: BatchProgress, log: string) => void | Promise<void>
): Promise<BatchRunResult> {
  const log: string[] = [];
  const progress: BatchProgress = {
    companiesTotal: 0,
    companiesDone: 0,
    sourcesDiscovered: 0,
    sourcesProcessed: 0,
    sourcesSkipped: 0,
    entriesSaved: 0,
    errors: 0,
  };

  let companies = await loadDisclosureCompanies({
    preferCache: true,
    exchanges: config.exchanges?.length ? config.exchanges : ["NGX", "FMDQ", "NASD"],
  });
  if (config.tickers?.length) {
    const tickers = new Set(config.tickers.map((t) => t.toUpperCase()));
    companies = companies.filter((c) => tickers.has(c.ticker));
  }
  if (config.maxCompanies && config.maxCompanies > 0) {
    companies = companies.slice(0, config.maxCompanies);
  }

  const exchangeLabel = (config.exchanges?.length ? config.exchanges : ["NGX", "FMDQ", "NASD"]).join("/");
  progress.companiesTotal = companies.length;
  appendLog(log, `Starting batch for ${companies.length} Nigeria disclosure companies (${exchangeLabel})`);
  await onProgress?.(progress, log.join("\n"));

  const delayMs = config.delayMs ?? 3000;

  for (const entry of companies) {
    progress.currentCompany = `${entry.name} [${entry.exchange}]`;
    appendLog(log, `Company: ${entry.name} (${entry.ticker}, ${entry.exchange})`);
    await onProgress?.(progress, log.join("\n"));

    try {
      const company = await upsertDisclosureCompany(supabase, entry);
      const countryModule = await loadCountryModule(supabase, company.country);

      let sources = await discoverSourcesForCompany(entry);
      sources = filterSourcesByTypes(sources, config.sourceTypes);
      progress.sourcesDiscovered += sources.length;
      appendLog(log, `Discovered ${sources.length} sources for ${entry.name}`);
      await onProgress?.(progress, log.join("\n"));

      for (const source of sources) {
        await processSource(supabase, {
          companyId: company.company_id,
          companyName: company.name,
          countryModule,
          source,
          config,
          progress,
          log,
        });
        await onProgress?.(progress, log.join("\n"));
        if (delayMs > 0) await sleep(delayMs);
      }
    } catch (e) {
      progress.errors += 1;
      const message = e instanceof Error ? e.message : "Unknown error";
      appendLog(log, `ERROR company ${entry.name}: ${message}`);
      await onProgress?.(progress, log.join("\n"));
    }

    progress.companiesDone += 1;
    progress.currentSource = undefined;
    await onProgress?.(progress, log.join("\n"));
  }

  appendLog(log, `Batch complete — ${progress.entriesSaved} entries saved, ${progress.errors} errors`);
  await onProgress?.(progress, log.join("\n"));

  return { progress, log: log.join("\n") };
}

export async function createBatchRunRecord(
  supabase: SupabaseClient,
  config: BatchConfig
): Promise<string> {
  const { data, error } = await supabase
    .from("batch_runs")
    .insert({ config, status: "running", progress: {}, log: "" })
    .select("run_id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Could not create batch run");
  }

  return data.run_id as string;
}

export async function updateBatchRunRecord(
  supabase: SupabaseClient,
  runId: string,
  patch: {
    status?: "running" | "completed" | "failed" | "cancelled";
    progress?: BatchProgress;
    log?: string;
    finished_at?: string;
  }
) {
  await supabase.from("batch_runs").update(patch).eq("run_id", runId);
}
