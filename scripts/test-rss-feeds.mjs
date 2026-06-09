import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const configSource = readFileSync(join(root, "lib/news/feedConfig.ts"), "utf8");

function parseSources(block) {
  return [...block.matchAll(/name:\s*"([^"]+)"[\s\S]*?url:\s*"([^"]+)"/g)].map((m) => ({
    name: m[1],
    url: m[2],
  }));
}

const tabs = [
  ...configSource.matchAll(/(?:"([^"]+)"|([A-Za-z0-9_-]+)):\s*\{[\s\S]*?sources:\s*\[([\s\S]*?)\],/g),
].map((m) => [m[1] || m[2], m[3]]);

async function testSource(name, url) {
  const res = await fetch(url, {
    headers: { Accept: "application/rss+xml, application/xml, text/xml", "User-Agent": "RewardologyAcademy/1.0" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
  const xml = await res.text();
  const count = (xml.match(/<item\b/gi) || []).length + (xml.match(/<entry\b/gi) || []).length;
  return { ok: count > 0, detail: count > 0 ? `${count} items` : "No items in feed" };
}

let passed = 0;
let failed = 0;

console.log("RSS feed verification (direct fetch)\n");

for (const [tab, block] of tabs) {
  const sources = parseSources(block);
  if (!sources.length) continue;

  console.log(`--- ${tab} ---`);
  for (const { name, url } of sources) {
    try {
      const result = await testSource(name, url);
      if (result.ok) passed += 1;
      else failed += 1;
      console.log(`${result.ok ? "OK" : "FAIL"}  ${name}: ${result.detail}`);
    } catch (error) {
      failed += 1;
      console.log(`FAIL  ${name}: ${error.message}`);
    }
  }
  console.log();
}

console.log(`Summary: ${passed} passed, ${failed} failed`);
process.exitCode = failed > 0 ? 1 : 0;
