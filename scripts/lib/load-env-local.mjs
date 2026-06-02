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

export const SUPABASE_PROJECT_REF = "fgkhowgggwbsosqhfnnz";
