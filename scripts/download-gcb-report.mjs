/** Download GCB report PDF via headless Chrome (bypasses Sucuri JS challenge). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "gcb-downloads");

const URL =
  process.argv[2] ??
  "https://www.gcbbank.com.gh/downloads/reports/433-2024-audited-financial-statements";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1280, height: 900 },
  });
  const page = await browser.newPage();

  let pdfBuffer = null;
  page.on("response", async (response) => {
    try {
      const ct = (response.headers()["content-type"] ?? "").toLowerCase();
      const u = response.url();
      if (ct.includes("pdf") || u.toLowerCase().includes(".pdf")) {
        const buf = Buffer.from(await response.buffer());
        if (buf.length > 5000 && buf.subarray(0, 4).toString() === "%PDF") {
          pdfBuffer = buf;
          console.log("Captured PDF:", u, buf.length, "bytes");
        }
      }
    } catch {
      /* ignore */
    }
  });

  console.log("Loading", URL);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 120000 });
  await new Promise((r) => setTimeout(r, 2000));

  await page.evaluate(() => {
    const allow = [...document.querySelectorAll("a, button")].find((el) =>
      /allow cookies/i.test(el.textContent ?? "")
    );
    allow?.click();
  });
  await new Promise((r) => setTimeout(r, 3000));

  const pdfHref = await page.evaluate(() => {
    const links = [...document.querySelectorAll("a")];
    const byText = links.find((a) =>
      /final gcb|annual publication|download \(pdf/i.test(a.textContent ?? "")
    );
    if (byText?.href) return byText.href;
    const byHref = links.find((a) => /\.pdf/i.test(a.getAttribute("href") ?? ""));
    return byHref?.href ?? null;
  });

  console.log("PDF href:", pdfHref);

  if (pdfHref) {
    await page.goto(pdfHref, { waitUntil: "networkidle2", timeout: 120000 });
    await new Promise((r) => setTimeout(r, 4000));
  }

  if (!pdfBuffer) {
    const links = await page.evaluate(() =>
      [...document.querySelectorAll("a")].map((a) => ({
        text: (a.textContent ?? "").trim().slice(0, 80),
        href: a.href,
      }))
    );
    console.log("Links on page:", links.slice(0, 15));
  }

  await browser.close();

  if (!pdfBuffer || pdfBuffer.length < 1000) {
    throw new Error("Could not capture GCB PDF — paste local file or download manually to data/gcb-downloads/");
  }

  const out = path.join(outDir, "gcb-2024-annual-report.pdf");
  fs.writeFileSync(out, pdfBuffer);
  console.log("Wrote", out, pdfBuffer.length, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
