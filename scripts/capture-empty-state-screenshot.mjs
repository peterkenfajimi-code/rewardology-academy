/**
 * Capture Session 3 screenshots after code changes (requires dev server on :3000).
 * Usage: node scripts/capture-empty-state-screenshot.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "screenshots", "session3");

async function waitForServer(url, attempts = 45) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const ready = await waitForServer("http://localhost:3000/benefits-repository", 5);
  if (!ready) {
    throw new Error("Dev server not reachable at http://localhost:3000 — start it first.");
  }

  const puppeteerPath = path.join(root, "node_modules", "puppeteer");
  if (!fs.existsSync(puppeteerPath)) {
    throw new Error("puppeteer not installed — run scripts/run-session3-verify.mjs once first.");
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();

  const files = [];

  async function shot(name, url, setup) {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
    if (setup) await setup(page);
    await new Promise((r) => setTimeout(r, 1500));
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    const bytes = fs.statSync(file).size;
    console.log(`${name}.png  ${bytes} bytes  ${file}`);
    files.push({ name, bytes, file });
    return file;
  }

  await shot("01-directory", "http://localhost:3000/benefits-repository");

  const apiRes = await fetch("http://localhost:3000/api/benefits-repository");
  const apiJson = await apiRes.json();
  const gtcoSlug =
    apiJson.companies?.find((c) => c.name?.includes("Guaranty"))?.slug ??
    apiJson.companies?.[0]?.slug;
  if (!gtcoSlug) throw new Error("No company slug from API");

  await shot(
    "02-profile-gtco",
    `http://localhost:3000/benefits-repository/${gtcoSlug}`,
    async (p) => {
      await p.waitForSelector(".benefits-repo-stat-card, .benefits-repo-narrative-card", {
        timeout: 30000,
      });
    }
  );

  await shot("03-empty-state", "http://localhost:3000/benefits-repository", async (p) => {
    await p.waitForSelector(".benefits-repo-filter-bar", { timeout: 30000 });
    const addButtons = await p.$$("button.benefits-repo-chip-add");
    for (const btn of addButtons) {
      const text = await p.evaluate((el) => el.textContent, btn);
      if (text?.includes("+ Country")) {
        await btn.click();
        break;
      }
    }
    await p.waitForSelector(".benefits-repo-filter-picker", { timeout: 10000 });
    const pickerButtons = await p.$$(".benefits-repo-filter-picker button");
    for (const btn of pickerButtons) {
      const text = await p.evaluate((el) => el.textContent, btn);
      if (text?.includes("Rwanda")) {
        await btn.click();
        break;
      }
    }
    await p.waitForSelector(".benefits-repo-empty", { timeout: 30000 });
    await p.waitForFunction(
      () => !document.body.textContent?.includes("Loading…"),
      { timeout: 30000 }
    );
  });

  await shot("04-methodology", "http://localhost:3000/benefits-repository/methodology");

  await browser.close();

  const log = files.map((f) => `${f.name}.png\t${f.bytes}`).join("\n");
  fs.writeFileSync(path.join(outDir, "verify-log.txt"), log);
  console.log("\nByte sizes:\n" + log);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
