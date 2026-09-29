/**
 * Probe GCB homepage nav for careers/jobs URLs after /careers 404'd.
 */
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const HOME = "https://www.gcbbank.com.gh/";

async function main() {
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1400, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(120000);
  await page.goto(HOME, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 4000));

  const payload = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a")].map((a) => ({
      text: (a.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 80),
      href: a.href,
    }));
    const careerish = links.filter((l) =>
      /career|job|vacanc|recruit|people|human|work with|join/i.test(`${l.text} ${l.href}`)
    );
    return { title: document.title, url: location.href, careerish, sample: links.slice(0, 40) };
  });

  await browser.close();
  const out = path.join(root, "data", "gcb-downloads", "homepage-links.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(payload, null, 2));
  console.log("title:", payload.title);
  console.log("url:", payload.url);
  console.log("careerish:", payload.careerish.length);
  for (const l of payload.careerish) console.log(`  ${l.text} → ${l.href}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
