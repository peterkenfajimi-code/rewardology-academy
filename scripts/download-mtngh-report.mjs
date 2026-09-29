/**
 * Download Scancom PLC (MTN Ghana) 2024 Annual Report PDF.
 * Writes data/mtn-ghana-downloads/mtngh-2024-annual-report.pdf
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "data", "mtn-ghana-downloads");
const URL =
  process.argv[2] ??
  "https://mtn.com.gh/wp-content/uploads/2025/03/MTNGH-2024-Annual-Report-vf.pdf";

async function main() {
  fs.mkdirSync(outDir, { recursive: true });
  console.log("Fetching", URL);
  const res = await fetch(URL, {
    headers: { "User-Agent": "RewardologyAcademyRepository/1.0" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 5000 || buf.subarray(0, 4).toString() !== "%PDF") {
    throw new Error(`Not a PDF (${buf.length} bytes, starts ${buf.subarray(0, 16).toString()})`);
  }
  const out = path.join(outDir, "mtngh-2024-annual-report.pdf");
  fs.writeFileSync(out, buf);
  console.log("Wrote", out, buf.length, "bytes");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
