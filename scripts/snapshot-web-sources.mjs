/**
 * Limited 6t: hash local annual-report PDFs; snapshot web-page sources into
 * the private source-snapshots bucket. Does not fetch annual-report PDFs.
 *
 * Usage: node scripts/snapshot-web-sources.mjs
 */
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA = "RewardologyAcademy/1.0 (benefits-repository source snapshot)";
const BUCKET = "source-snapshots";
const MAX = 1024 * 1024;
const WEB_TYPES = new Set(["careers_page", "linkedin", "press_release"]);

function loadEnvLocal() {
  for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    if (!process.env[t.slice(0, i).trim()]) process.env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
}

function sha256(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function resolveLocalFile(rel) {
  if (!rel || rel.startsWith("http") || rel.includes("source-snapshots/")) return null;
  if (path.isAbsolute(rel) && fs.existsSync(rel)) return rel;
  const abs = path.join(root, rel);
  return fs.existsSync(abs) ? abs : null;
}

loadEnvLocal();
const supabase = createClient(
  process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL,
  process.env.REPOSITORY_SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

const { data: sources, error } = await supabase
  .from("sources")
  .select("source_id, company_id, source_type, source_url, source_title, raw_snapshot_path, content_sha256");
if (error) throw new Error(error.message);

const out = { hashed_annual_reports: [], web_snapshots: [], skipped: [] };

for (const src of sources ?? []) {
  if (src.source_type === "annual_report" || src.source_type === "sustainability_report") {
    if (src.content_sha256) {
      out.skipped.push({ id: src.source_id, reason: "already hashed", type: src.source_type, title: src.source_title });
      continue;
    }
    const abs = resolveLocalFile(src.raw_snapshot_path);
    if (!abs) {
      out.skipped.push({
        id: src.source_id,
        reason: "URL stored; local PDF not present — not fetched",
        type: src.source_type,
        title: src.source_title,
      });
      continue;
    }
    const buf = fs.readFileSync(abs);
    const hash = sha256(buf);
    const { error: uErr } = await supabase
      .from("sources")
      .update({ content_sha256: hash, snapshot_captured_at: new Date().toISOString() })
      .eq("source_id", src.source_id);
    if (uErr) throw new Error(`hash ${src.source_id}: ${uErr.message}`);
    out.hashed_annual_reports.push({ id: src.source_id, title: src.source_title, bytes: buf.length, sha256: hash });
    continue;
  }

  if (!WEB_TYPES.has(src.source_type)) continue;
  if (!src.source_url || src.source_url.includes("#pasted") || src.source_url.includes("#indexed")) {
    out.skipped.push({ id: src.source_id, reason: "no live URL / pasted excerpt", type: src.source_type, title: src.source_title });
    continue;
  }
  if (src.content_sha256) {
    out.skipped.push({ id: src.source_id, reason: "already snapshotted", type: src.source_type, url: src.source_url });
    continue;
  }
  if (src.source_type === "linkedin") {
    out.skipped.push({ id: src.source_id, reason: "LinkedIn login wall — not fetched", url: src.source_url });
    continue;
  }

  try {
    const res = await fetch(src.source_url, { headers: { "User-Agent": UA }, redirect: "follow" });
    if (!res.ok) {
      out.skipped.push({ id: src.source_id, reason: `HTTP ${res.status}`, url: src.source_url });
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const isPdf = buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46;
    const hash = sha256(buf);
    if (isPdf) {
      const { error: uErr } = await supabase
        .from("sources")
        .update({ content_sha256: hash, snapshot_captured_at: new Date().toISOString() })
        .eq("source_id", src.source_id);
      if (uErr) throw new Error(`hash pdf ${src.source_id}: ${uErr.message}`);
      out.hashed_annual_reports.push({
        id: src.source_id,
        title: src.source_title,
        bytes: buf.length,
        sha256: hash,
        note: "PDF URL hashed; not stored in the web snapshot bucket",
      });
      continue;
    }
    if (buf.length > MAX) {
      out.skipped.push({ id: src.source_id, reason: `${buf.length} > 1MB`, url: src.source_url });
      continue;
    }
    const storagePath = `${src.source_id}/${Date.now()}.html`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buf, { contentType: "text/html", upsert: false });
    if (upErr) throw new Error(`upload ${src.source_id}: ${upErr.message}`);
    const { error: uErr } = await supabase
      .from("sources")
      .update({
        raw_snapshot_path: storagePath,
        content_sha256: hash,
        snapshot_captured_at: new Date().toISOString(),
      })
      .eq("source_id", src.source_id);
    if (uErr) throw new Error(`update ${src.source_id}: ${uErr.message}`);
    out.web_snapshots.push({ id: src.source_id, url: src.source_url, sha256: hash, path: storagePath, bytes: buf.length });
  } catch (e) {
    out.skipped.push({ id: src.source_id, reason: e.message, url: src.source_url });
  }
}

console.log(JSON.stringify(out, null, 2));
