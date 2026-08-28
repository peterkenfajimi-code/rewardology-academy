/** Capture Safaricom published profile screenshot from live or local dev. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "screenshots", "session3");
const slug = "safaricom-plc-ke";
const base = process.argv[2] ?? "https://rewardologyacademy.com";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();
  const url = `${base}/benefits-repository/${slug}`;
  await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
  await page.waitForSelector(".benefits-repo-stat-card, .benefits-repo-narrative-card, .benefits-repo-empty", {
    timeout: 60000,
  });
  await new Promise((r) => setTimeout(r, 2000));
  const file = path.join(outDir, "05-profile-safaricom.png");
  await page.screenshot({ path: file, fullPage: true });
  const bytes = fs.statSync(file).size;
  console.log(`${file}  ${bytes} bytes  ${url}`);
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
