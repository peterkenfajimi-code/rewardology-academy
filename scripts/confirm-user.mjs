import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const projectRef = "fgkhowgggwbsosqhfnnz";
const email = "peterkenfajimi@gmail.com";

function loadEnvLocal() {
  const envPath = path.join(root, ".env.local");
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

const token = loadEnvLocal().SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("No SUPABASE_ACCESS_TOKEN in .env.local");
  process.exit(1);
}

async function query(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text}`);
  return JSON.parse(text);
}

const users = await query(
  `select id, email, email_confirmed_at, created_at from auth.users where email = '${email}' limit 1;`
);
console.log("User:", JSON.stringify(users, null, 2));

if (users?.[0] && !users[0].email_confirmed_at) {
  await query(
    `update auth.users set email_confirmed_at = now(), confirmed_at = now() where email = '${email}';`
  );
  console.log("Email confirmed manually.");
} else if (users?.[0]?.email_confirmed_at) {
  console.log("Already confirmed.");
} else {
  console.log("No user found for that email.");
}
