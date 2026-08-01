/**
 * Copy comic page PNGs from a local source folder into public/assets/comics/.
 *
 * Expected layout for a single issue:
 *   assets/comics-source/issue-1/01-cover.png
 *   assets/comics-source/issue-1/02-inside-cover.png
 *   ...
 *
 * Override source root: COMICS_SOURCE_DIR=/path/to/folder node scripts/copy-comics.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const srcRoot = process.env.COMICS_SOURCE_DIR || path.join(root, "assets", "comics-source");
const destRoot = path.join(root, "public", "assets", "comics");

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return 0;
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(from, to);
      continue;
    }
    if (!/\.(png|jpg|jpeg|webp)$/i.test(entry.name)) continue;
    fs.copyFileSync(from, to);
    console.log(`copied ${path.relative(root, to)}`);
    count += 1;
  }
  return count;
}

if (!fs.existsSync(srcRoot)) {
  console.error(`Source folder not found: ${srcRoot}`);
  console.error("Create assets/comics-source/issue-1/ with page PNGs, or set COMICS_SOURCE_DIR.");
  process.exit(1);
}

const copied = copyDir(srcRoot, destRoot);
if (copied === 0) {
  console.error("No image files found to copy.");
  process.exit(1);
}

console.log(`done: ${copied} file(s) copied to public/assets/comics/`);
