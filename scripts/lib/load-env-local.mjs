import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export function getProjectRoot(fromImportMetaUrl) {
  const __dirname = path.dirname(fileURLToPath(fromImportMetaUrl));
  return path.resolve(__dirname, "..", "..");
}

export function resolveProjectRoot(preferredRoot) {
  const candidates = [preferredRoot, process.cwd()].filter(Boolean);
  for (const root of candidates) {
    if (fs.existsSync(path.join(root, ".env.local"))) return root;
    if (fs.existsSync(path.join(root, "package.json"))) return root;
  }
  return preferredRoot || process.cwd();
}

export function loadEnvLocal(root) {
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const env = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return env;
}

export function getSupabaseAccessToken(root) {
  const resolved = resolveProjectRoot(root);
  const env = loadEnvLocal(resolved);
  return process.env.SUPABASE_ACCESS_TOKEN || env.SUPABASE_ACCESS_TOKEN;
}

/** Admin email from env — never hardcode personal addresses in source. */
export function getAdminEmail(root, { required = false } = {}) {
  const resolved = resolveProjectRoot(root);
  const env = loadEnvLocal(resolved);
  const email = (
    process.env.ADMIN_EMAIL ||
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    env.ADMIN_EMAIL ||
    env.NEXT_PUBLIC_ADMIN_EMAIL ||
    ""
  ).trim();
  if (!email && required) {
    console.error(`
Missing ADMIN_EMAIL.

Add to .env.local:
  ADMIN_EMAIL=you@example.com
  NEXT_PUBLIC_ADMIN_EMAIL=you@example.com   (same value — required for /setup in the browser)
`);
    process.exit(1);
  }
  return email;
}

export function applySqlAdminEmail(sql, adminEmail) {
  const safe = adminEmail.replace(/'/g, "''");
  return sql.replaceAll("__ADMIN_EMAIL__", safe);
}

export const SUPABASE_PROJECT_REF = "fgkhowgggwbsosqhfnnz";
