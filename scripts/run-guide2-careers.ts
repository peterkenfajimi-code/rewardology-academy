/**
 * Guide 2 careers-page extract + reconcile for GTCO, MTN (JSE), Safaricom, GCB.
 * Reads data/guide2-downloads/{TICKER}.txt from scripts/fetch-guide2-careers.mjs.
 *
 * Usage: npx tsx scripts/run-guide2-careers.ts
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { extractBenefitsFromSource } from "../lib/repository/extract-benefits";
import { loadFieldRegistry } from "../lib/repository/field-registry";
import { saveSourceAndEntries } from "../lib/repository/save-source";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tickerFilter = process.argv.find((a) => a.startsWith("--ticker="))?.slice("--ticker=".length)?.toUpperCase();
const ACTOR = "guide2-careers";
const DOWNLOADS = path.join(root, "data", "guide2-downloads");

const COMPANIES = [
  { ticker: "GTCO", exchange: "NGX", url: "https://www.gtcoplc.com/who-we-are/careers" },
  { ticker: "MTN", exchange: "JSE", url: "https://www.mtn.com/join-our-yello-family-people-and-culture/" },
  { ticker: "SCOM", exchange: "NSE", url: "https://www.safaricom.co.ke/careers/" },
  { ticker: "GCB", exchange: "GSE", url: "https://www.gcbbank.com.gh/careers" },
] as const;

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

function loadPageText(ticker: string): { title: string; body: string } {
  const file = path.join(DOWNLOADS, `${ticker}.txt`);
  if (!fs.existsSync(file)) throw new Error(`Missing ${file} — run node scripts/fetch-guide2-careers.mjs`);
  const raw = fs.readFileSync(file, "utf8");
  const title = raw.match(/^title:\s*(.*)$/m)?.[1]?.trim() ?? "";
  const body = raw.replace(/^[\s\S]*?\n\n/, "").trim();
  return { title, body };
}

function is404(title: string, body: string): boolean {
  return /404|article not found|page not found/i.test(`${title}\n${body}`);
}

function isBlocked(title: string, body: string): boolean {
  return /cloudfront|request blocked|could not be satisfied|access denied/i.test(`${title}\n${body}`);
}

/** Indexed 2026-09 excerpt of /careers/ after live Chrome fetch returned CloudFront 403. */
const SCOM_INDEXED_EXCERPT = `
Safaricom Careers

Our people are our most valuable asset and are key to the achievement of our vision of transforming lives. This is reflected in our commitment to creating a working environment that supports our staff. We offer employees a wellness programme, crèche facilities, access to subsidized gym facilities, leisure amenities, regular social events, competitive salaries and career opportunities.
`.trim();

function looksBenefitsBearing(body: string): boolean {
  return /employee benefit|staff benefit|we offer employees|wellness programme|crèche|creche|subsidi[sz]ed gym|medical cover|hmo|annual leave|group life|gratuity/i.test(
    body
  );
}

async function main() {
  loadEnvLocal();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL!,
    process.env.REPOSITORY_SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
  const registryRows = await loadFieldRegistry(supabase);

  for (const spec of COMPANIES) {
    if (tickerFilter && spec.ticker !== tickerFilter) continue;
    console.log(`\n======== ${spec.ticker} ========`);
    const page = loadPageText(spec.ticker);
    let body = page.body;
    if (is404(page.title, body)) {
      console.log("SKIP extract — careers URL is 404 / not a live page.");
      continue;
    }
    if (isBlocked(page.title, body) && spec.ticker === "SCOM") {
      console.log("CloudFront 403 on live /careers — using search-indexed excerpt of the same URL.");
      body = SCOM_INDEXED_EXCERPT;
    } else if (isBlocked(page.title, body)) {
      console.log("SKIP extract — live fetch blocked.");
      continue;
    }
    if (!looksBenefitsBearing(body)) {
      console.log(
        `SKIP extract — page is live (${body.length} chars) but has no benefits-bearing language (recruitment marketing only).`
      );
      continue;
    }

    const { data: company } = await supabase
      .from("companies")
      .select("company_id, name, country")
      .eq("exchange_ticker", spec.ticker)
      .eq("listing_exchange", spec.exchange)
      .maybeSingle();
    if (!company) {
      console.log(`SKIP — company ${spec.ticker}/${spec.exchange} not in DB`);
      continue;
    }

    const { data: mod } = await supabase.from("country_modules").select("*").eq("country_code", company.country).single();
    console.log(`Extracting ${company.name} (${body.length} chars)…`);
    const extracted = await extractBenefitsFromSource({
      companyName: company.name,
      countryModule: mod,
      registryRows,
      rawText: body,
    });
    const keepers = extracted.entries.filter((e) => {
      if (e.field === "compensation_philosophy_statement" && /competitive salaries/i.test(e.value ?? "")) {
        console.log(`DROP ${e.category}.${e.field} — recruitment marketing, not a pay philosophy.`);
        return false;
      }
      return true;
    });
    console.log(`Benefits: ${keepers.length} kept / ${extracted.entries.length} extracted, workforce: ${extracted.workforceComposition.length}`);
    for (const e of keepers) {
      console.log(`  ${e.category}.${e.field} = ${JSON.stringify(e.value)} [${e.confidence_score}]`);
    }

    const saved = await saveSourceAndEntries(supabase, {
      companyId: company.company_id,
      source: {
        source_type: "careers_page",
        source_url: spec.ticker === "SCOM" ? `${spec.url}#indexed-excerpt-2026-09` : `${spec.url}#guide2-live-v1`,
        source_title:
          spec.ticker === "SCOM"
            ? "Safaricom Careers (Guide 2 indexed excerpt — live fetch CloudFront 403)"
            : `${spec.ticker} Careers (Guide 2 live)`,
        country: company.country,
      },
      entries: keepers,
      workforceComposition: extracted.workforceComposition,
      publish: true,
      actor: ACTOR,
      skipIfUrlExists: false,
    });
    for (const r of saved.results) {
      console.log(`  ${r.action} → ${r.publish_status}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
