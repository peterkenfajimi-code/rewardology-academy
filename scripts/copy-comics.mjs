import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const src = path.join(
  process.env.USERPROFILE,
  ".cursor/projects/c-Users-pfajimi-OneDrive-Nigerian-Exchange-Group-Documents-Peter-Fajimi-Peter-Personal-Folder-Peter-s-Personal-records-AI-Work-REWARDOLOGY-ACADEMY/assets"
);
const dest = path.join(root, "public/assets/comics");

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
