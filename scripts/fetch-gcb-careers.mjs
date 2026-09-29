/**
 * Fetch GCB careers page text via headless Chrome (Sucuri JS challenge).
 * Writes data/gcb-downloads/careers.txt
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "gcb-downloads");
const CAREERS_URL = process.argv[2] ?? "https://www.gcbbank.com.gh/careers";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1280, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);

  console.log("Loading", CAREERS_URL);
  await page.goto(CAREERS_URL, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 4000));

  const title = await page.title();
  const url = page.url();
  console.log("Landed", url, "title:", title);

  await page.evaluate(() => {
    const allow = [...document.querySelectorAll("a, button")].find((el) =>
      /allow cookies|accept/i.test(el.textContent ?? "")
    );
    allow?.click();
  });
  await new Promise((r) => setTimeout(r, 1500));

  const text = await page.evaluate(() => {
    const rootEl = document.querySelector("main, article, .page, #content, body");
    return (rootEl?.innerText ?? document.body.innerText ?? "").replace(/\n{3,}/g, "\n\n").trim();
  });

  await browser.close();

  if (!text || text.length < 80 || /sucuri_cloudproxy|enable javascript/i.test(text)) {
    throw new Error(`Careers page still blocked or empty (${text.length} chars)`);
  }

  const out = path.join(outDir, "careers.txt");
  fs.writeFileSync(out, `${CAREERS_URL}\n\n${text}`);
  console.log("Wrote", out, text.length, "chars");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
