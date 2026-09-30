/**
 * Fetch Guide 2 careers pages via headless Chrome (JS/bot walls).
 * Writes data/guide2-downloads/{ticker}.txt
 *
 * Usage: node scripts/fetch-guide2-careers.mjs [--ticker=MTNGH]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "guide2-downloads");

const PAGES = [
  { ticker: "GTCO", url: "https://www.gtcoplc.com/who-we-are/careers" },
  { ticker: "MTN", url: "https://www.mtn.com/join-our-yello-family-people-and-culture/" },
  { ticker: "SCOM", url: "https://www.safaricom.co.ke/careers/" },
  { ticker: "GCB", url: "https://www.gcbbank.com.gh/careers" },
  { ticker: "MTNGH", url: "https://mtn.com.gh/careers/" },
];
const tickerFilter = process.argv.find((a) => a.startsWith("--ticker="))?.slice("--ticker=".length).toUpperCase();

async function fetchOne(page, ticker, url) {
  console.log("Loading", ticker, url);
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 4000));
  await page.evaluate(() => {
    const allow = [...document.querySelectorAll("a, button")].find((el) =>
      /allow cookies|accept/i.test(el.textContent ?? "")
    );
    allow?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const landed = page.url();
  const title = await page.title();
  const text = await page.evaluate(() => {
    const rootEl = document.querySelector("main, article, .page, #content, body");
    return (rootEl?.innerText ?? document.body.innerText ?? "").replace(/\n{3,}/g, "\n\n").trim();
  });
  const out = path.join(outDir, `${ticker}.txt`);
  fs.writeFileSync(out, `${url}\nlanded: ${landed}\ntitle: ${title}\n\n${text}`);
  console.log(`  wrote ${out} (${text.length} chars) title=${title}`);
  return { ticker, landed, title, chars: text.length };
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  const results = [];
  for (const row of PAGES) {
    if (tickerFilter && row.ticker !== tickerFilter) continue;
    try {
      results.push(await fetchOne(page, row.ticker, row.url));
    } catch (e) {
      console.error(`FAIL ${row.ticker}:`, e instanceof Error ? e.message : e);
    }
  }
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
