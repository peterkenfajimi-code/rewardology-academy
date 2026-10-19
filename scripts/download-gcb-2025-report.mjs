/** Download GCB 2025 AR PDF via headless Chrome (bypasses Sucuri JS challenge). */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "gcb-downloads");

const PAGE_URL =
  process.argv[2] ??
  "https://www.gcbbank.com.gh/group-results-and-reporting/462-2025-annual-report";
const FILE_URL = "https://www.gcbbank.com.gh/group-results-and-reporting/462-2025-annual-report/file";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  const startedAt = Date.now() - 1000;
  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({
    headless: true,
    channel: "chrome",
    defaultViewport: { width: 1280, height: 900 },
    args: ["--disable-features=PdfViewer", "--disable-pdf-extension"],
  });
  const page = await browser.newPage();

  let pdfBuffer = null;
  const session = await page.createCDPSession();
  await session.send("Page.setDownloadBehavior", {
    behavior: "allow",
    downloadPath: outDir,
    eventsEnabled: true,
  });

  page.on("response", async (response) => {
    try {
      const buf = Buffer.from(await response.buffer());
      if (buf.length > 5000 && buf.subarray(0, 4).toString() === "%PDF") {
        pdfBuffer = buf;
        console.log("Captured PDF:", response.url(), buf.length, "bytes");
      }
    } catch {
      /* ignore */
    }
  });

  console.log("Loading", PAGE_URL);
  await page.goto(PAGE_URL, { waitUntil: "networkidle2", timeout: 120000 });
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
      /view\s*\(\s*pdf|final gcb ar 2025|download \(pdf/i.test(a.textContent ?? "")
    );
    if (byText?.href) return byText.href;
    const byHref = links.find((a) => /\.pdf|\/file\/?$/i.test(a.getAttribute("href") ?? ""));
    return byHref?.href ?? null;
  });

  console.log("PDF href:", pdfHref);

  if (pdfHref) {
    await page.evaluate(() => {
      const a = [...document.querySelectorAll("a")].find((el) =>
        /view\s*\(\s*pdf|final gcb ar 2025|download \(pdf/i.test(el.textContent ?? "")
      );
      a?.click();
    });
    await new Promise((r) => setTimeout(r, 12000));
  }

  if (!pdfBuffer) {
    const target = pdfHref || FILE_URL;
    const cookies = await page.cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
    console.log("Cookie fetch", target);
    const res = await fetch(target, {
      redirect: "manual",
      headers: {
        Cookie: cookieHeader,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/pdf,*/*",
        Referer: PAGE_URL,
      },
    });
    const loc = res.headers.get("location");
    console.log("cookie-fetch", res.status, res.headers.get("content-type"), loc);
    const followUrl = loc && !res.ok ? new URL(loc, target).href : target;
    const fileRes =
      loc && res.status >= 300 && res.status < 400
        ? await fetch(followUrl, {
            redirect: "follow",
            headers: {
              Cookie: cookieHeader,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
              Accept: "application/pdf,*/*",
              Referer: PAGE_URL,
            },
          })
        : res;
    const buf = Buffer.from(await fileRes.arrayBuffer());
    console.log("file-body", fileRes.status, fileRes.headers.get("content-type"), buf.length, buf.subarray(0, 8).toString());
    if (buf.length > 5000 && buf.subarray(0, 4).toString() === "%PDF") {
      pdfBuffer = buf;
    }
  }

  if (!pdfBuffer) {
    const downloaded = fs
      .readdirSync(outDir)
      .filter((n) => n.toLowerCase().endsWith(".pdf") && !/2024/i.test(n))
      .map((n) => ({ n, t: fs.statSync(path.join(outDir, n)).mtimeMs }))
      .filter((f) => f.t >= startedAt)
      .sort((a, b) => b.t - a.t)[0];
    if (downloaded) {
      const candidate = path.join(outDir, downloaded.n);
      const buf = fs.readFileSync(candidate);
      if (buf.length > 5000 && buf.subarray(0, 4).toString() === "%PDF") {
        console.log("Found download", downloaded.n, buf.length);
        pdfBuffer = buf;
      }
    }
  }

  await browser.close();

  if (!pdfBuffer || pdfBuffer.length < 1000) {
    throw new Error(
      "Could not capture GCB 2025 PDF — paste local file to data/gcb-downloads/gcb-2025-annual-report.pdf"
    );
  }

  const out = path.join(outDir, "gcb-2025-annual-report.pdf");
  fs.writeFileSync(out, pdfBuffer);
  console.log("Wrote", out, pdfBuffer.length, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
