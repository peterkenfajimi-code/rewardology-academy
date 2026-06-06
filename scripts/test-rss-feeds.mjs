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
  const params = new URLSearchParams({ rss_url: url });
  const apiKey = process.env.RSS2JSON_API_KEY;
  if (apiKey) {
    params.set("api_key", apiKey);
    params.set("count", "4");
  }

  const res = await fetch(`https://api.rss2json.com/v1/api.json?${params}`, {
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json();
  const ok = res.ok && data.status === "ok" && data.items?.length;
  return {
    ok,
    detail: ok ? `${data.items.length} items` : data.message || `HTTP ${res.status}`,
  };
}

let passed = 0;
let failed = 0;

console.log("RSS feed verification (rss2json)\n");

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
