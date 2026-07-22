/**
 * Copy comic PNGs from a local source folder into public/assets/comics.
 *
 * Default source: assets/comics-source/ (place timestamped PNG exports there)
 * Override: COMICS_SOURCE_DIR=/path/to/folder node scripts/copy-comics.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = process.env.COMICS_SOURCE_DIR || path.join(root, "assets", "comics-source");
const dest = path.join(root, "public", "assets", "comics");

if (!fs.existsSync(src)) {
  console.error(`Source folder not found: ${src}`);
  console.error("Create assets/comics-source/ and add PNG exports, or set COMICS_SOURCE_DIR.");
  process.exit(1);
}

fs.mkdirSync(dest, { recursive: true });

const map = [
  ["07_19_46", "series-cover.png"],
  ["10_44_27", "issue-1.png"],
  ["11_45_11", "issue-2.png"],
  ["11_01_39", "issue-3.png"],
  ["11_07_11", "issue-4.png"],
  ["11_15_05", "issue-5.png"],
];

for (const file of fs.readdirSync(src)) {
  for (const [key, out] of map) {
    if (file.includes(key)) {
      fs.copyFileSync(path.join(src, file), path.join(dest, out));
      console.log(`copied ${out}`);
    }
  }
}

console.log("done:", fs.readdirSync(dest));
