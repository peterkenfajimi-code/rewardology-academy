/**
 * Apply migration 010 + backfill slugs + capture Session 3 UI screenshots.
 * Usage: node scripts/run-session3-verify.mjs
 */
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getProjectRoot, loadEnvLocal, resolveProjectRoot } from "./lib/load-env-local.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = resolveProjectRoot(getProjectRoot(import.meta.url));
const env = loadEnvLocal(root);
const token = env.REPOSITORY_SUPABASE_ACCESS_TOKEN;
const projectRef = env.REPOSITORY_SUPABASE_PROJECT_REF;
const outDir = path.join(root, "screenshots", "session3");
const log = [];

function note(msg) {
  console.log(msg);
  log.push(msg);
}

async function runQuery(label, query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  const body = await res.text();
  if (!res.ok) throw new Error(`${label} failed (${res.status}): ${body.slice(0, 400)}`);
  note(`${label} OK`);
  return body;
}

async function waitForServer(url, attempts = 30) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return true;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  return false;
}

async function main() {
  if (!token || !projectRef) {
    throw new Error("Missing REPOSITORY_SUPABASE_ACCESS_TOKEN or REPOSITORY_SUPABASE_PROJECT_REF");
  }

  fs.mkdirSync(outDir, { recursive: true });

  const migration010 = fs.readFileSync(
    path.join(root, "supabase", "benefits-repository", "migrations", "010_company_slug.sql"),
    "utf8"
  );
  await runQuery("Migration 010", migration010);

  const backfillEnv = {
    ...process.env,
    PATH: `C:\\Users\\pfajimi\\node-portable;${process.env.PATH ?? ""}`,
    NEXT_PUBLIC_REPOSITORY_SUPABASE_URL: env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL,
    REPOSITORY_SUPABASE_SERVICE_KEY: env.REPOSITORY_SUPABASE_SERVICE_KEY,
    NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_REPOSITORY_SUPABASE_ANON_KEY,
  };
  const backfill = spawnSync(
    "npx",
    ["tsx", path.join(root, "scripts/backfill-company-slugs.ts")],
    {
      cwd: root,
      env: backfillEnv,
      encoding: "utf8",
      shell: true,
    }
  );
  note(backfill.stdout || "");
  if (backfill.status !== 0) {
    throw new Error(`Backfill failed: ${backfill.stderr || backfill.stdout}`);
  }

  const slugCheck = await runQuery(
    "Slug verify",
    "select name, country, slug from companies order by name;"
  );
  note(`Slugs in DB: ${slugCheck}`);

  const serverUp = await waitForServer("http://localhost:3000/benefits-repository");
  if (!serverUp) {
    note("Starting dev server...");
    spawnSync("cmd.exe", ["/c", "C:\\Users\\pfajimi\\start-rewardology-dev.cmd"], {
      cwd: "C:\\Users\\pfajimi",
      detached: true,
      stdio: "ignore",
    });
    const ready = await waitForServer("http://localhost:3000/benefits-repository", 45);
    if (!ready) throw new Error("Dev server did not start on :3000");
  }

  // Install puppeteer locally if needed and capture screenshots
  const puppeteerPath = path.join(root, "node_modules", "puppeteer");
  if (!fs.existsSync(puppeteerPath)) {
    note("Installing puppeteer for screenshots...");
    const install = spawnSync("npm", ["install", "puppeteer@23", "--no-save"], {
      cwd: root,
      env: { ...process.env, PATH: `C:\\Users\\pfajimi\\node-portable;${process.env.PATH ?? ""}` },
      encoding: "utf8",
    });
    if (install.status !== 0) throw new Error(install.stderr || install.stdout);
  }

  const puppeteer = await import("puppeteer");
  const browser = await puppeteer.default.launch({ headless: true, defaultViewport: { width: 1400, height: 900 } });
  const page = await browser.newPage();

  async function shot(name, url, setup) {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 120000 });
    if (setup) await setup(page);
    await new Promise((r) => setTimeout(r, 1500));
    const file = path.join(outDir, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    note(`Screenshot: ${file}`);
    return file;
  }

  await shot("01-directory", "http://localhost:3000/benefits-repository");

  const slugRows = JSON.parse(slugCheck);
  const gtcoRow = slugRows.find((r) => r.name?.includes("Guaranty")) ?? slugRows[0];
  const gtcoSlug = gtcoRow?.slug;
  if (!gtcoSlug) throw new Error("No slug found in companies table after backfill");
  note(`Using profile slug: ${gtcoSlug}`);

  await shot(
    "02-profile-gtco",
    `http://localhost:3000/benefits-repository/${gtcoSlug}`,
    async (p) => {
      await p.waitForSelector(".benefits-repo-stat-card, .benefits-repo-narrative-card", { timeout: 30000 });
    }
  );

  // Empty state: add Rwanda country chip (no companies in RW yet)
  await shot("03-empty-state", "http://localhost:3000/benefits-repository", async (p) => {
    await p.waitForSelector(".benefits-repo-filter-bar", { timeout: 30000 });
    await p.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent?.includes("+ Country"));
      btn?.click();
    });
    await p.waitForSelector(".benefits-repo-filter-picker button", { timeout: 10000 });
    await p.evaluate(() => {
      const btn = Array.from(document.querySelectorAll(".benefits-repo-filter-picker button")).find((b) =>
        b.textContent?.includes("Rwanda")
      );
      btn?.click();
    });
    await p.waitForSelector(".benefits-repo-empty", { timeout: 30000 });
  });

  await shot("04-methodology", "http://localhost:3000/benefits-repository/methodology");

  await browser.close();

  fs.writeFileSync(path.join(outDir, "verify-log.txt"), log.join("\n"));
  note(`Done. Screenshots in ${outDir}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
