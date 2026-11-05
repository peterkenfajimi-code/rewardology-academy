/**
 * Store the Stanbic Bank Ghana Ltd logo from stanbicbank.com.gh (company site).
 * Usage: node scripts/record-stanbic-logo.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "RewardologyAcademy/1.0 (benefits-repository stanbic ghana logo)";
const BUCKET = "company-logos";
const MAX = 1024 * 1024;
const SLUG = "stanbic-bank-ghana-ltd-gh";
const DOMAIN = "stanbicbank.com.gh";
const RETRIEVED = "2026-11-05";
const LICENCE =
  "company site — factual use; mark remains Stanbic Bank Ghana Ltd / Standard Bank Group's trademark";
const CANDIDATES = [
  "https://www.stanbicbank.com.gh/file_source/assets/icons/StanbicBank.svg",
  "https://www.stanbicbank.com.gh/static_file/assets/icons/StanbicBank.svg",
];

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

function detectLogoMime(bytes) {
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    String.fromCharCode(...bytes.subarray(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.subarray(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  const head = new TextDecoder().decode(bytes.subarray(0, 512)).trimStart().toLowerCase();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return null;
}

function logoExtension(mime) {
  return { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/svg+xml": "svg" }[mime] ?? null;
}

async function fetchBytes(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return { error: `HTTP ${res.status}` };
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (bytes.length > MAX) return { error: `${bytes.length} bytes > 1MB` };
  const mime = detectLogoMime(bytes);
  if (!mime) return { error: "not a png/jpeg/webp/svg" };
  return { bytes, mime, url: res.url, length: bytes.length };
}

async function discoverFromHomepage() {
  const res = await fetch(`https://www.${DOMAIN}`, { headers: { "User-Agent": UA }, redirect: "follow" });
  if (!res.ok) return [];
  const html = await res.text();
  const hrefs = new Set();
  const icon = html.match(/data-icon=["']StanbicBank["'][^>]*data-path=["']([^"']+)["']/i);
  if (icon) {
    try {
      hrefs.add(new URL(`${icon[1].replace(/\/$/, "")}/StanbicBank.svg`, res.url).href);
    } catch {
      /* skip */
    }
  }
  return [...hrefs];
}

loadEnvLocal();
const supabase = createClient(
  process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL,
  process.env.REPOSITORY_SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const { data: company, error } = await supabase
  .from("companies")
  .select("company_id, name, slug, logo_storage_path")
  .eq("slug", SLUG)
  .single();
if (error || !company) throw new Error(error?.message ?? "Stanbic company missing");

const discovered = await discoverFromHomepage().catch(() => []);
const urls = [...CANDIDATES, ...discovered];
let logo = null;
const tries = [];
for (const url of [...new Set(urls)]) {
  const got = await fetchBytes(url).catch((e) => ({ error: e.message }));
  tries.push({ url, result: got.error ?? `${got.mime} ${got.length}b` });
  if (got.bytes && !logo) logo = got;
}
console.log(JSON.stringify({ tries, picked: logo ? { url: logo.url, mime: logo.mime, bytes: logo.length } : null }, null, 2));
if (!logo) throw new Error("No usable Stanbic logo from stanbicbank.com.gh");

const storagePath = `${company.company_id}/${Date.now()}.${logoExtension(logo.mime)}`;
const { error: upErr } = await supabase.storage
  .from(BUCKET)
  .upload(storagePath, logo.bytes, { contentType: logo.mime, upsert: false });
if (upErr) throw new Error(`upload: ${upErr.message}`);

const { error: uErr } = await supabase
  .from("companies")
  .update({
    website_domain: DOMAIN,
    logo_storage_path: storagePath,
    logo_source_url: logo.url,
    logo_licence: LICENCE,
    logo_retrieved_at: RETRIEVED,
  })
  .eq("company_id", company.company_id);
if (uErr) throw new Error(`update: ${uErr.message}`);
console.log(`SAVE ${company.name} ${storagePath} from ${logo.url}`);
