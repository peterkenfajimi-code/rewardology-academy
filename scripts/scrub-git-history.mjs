/**
 * Scrub sensitive strings from entire git history using git-filter-repo.
 *
 * 1. pip install git-filter-repo
 * 2. Copy scripts/git-history-replacements.example.txt → git-history-replacements.local.txt
 * 3. Edit the local file with strings you want redacted (never commit it)
 * 4. node scripts/scrub-git-history.mjs
 * 5. git push origin main --force   (rewrites GitHub — coordinate first)
 */
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const localPath = path.join(root, "scripts", "git-history-replacements.local.txt");

if (!fs.existsSync(localPath)) {
  console.error(`
Missing ${localPath}

Copy scripts/git-history-replacements.example.txt to git-history-replacements.local.txt
and list each string to redact (git-filter-repo --replace-text format):

  old-string==>REDACTED

Then re-run: node scripts/scrub-git-history.mjs
`);
  process.exit(1);
}

console.log("Running git filter-repo...\n");

try {
  execSync(`git filter-repo --force --replace-text "${localPath}"`, {
    cwd: root,
    stdio: "inherit",
  });
  console.log("\nHistory scrubbed locally.");
  console.log("Review, then publish with: git push origin main --force");
} catch {
  console.error("\nFailed. Install git-filter-repo: pip install git-filter-repo");
  process.exit(1);
}
