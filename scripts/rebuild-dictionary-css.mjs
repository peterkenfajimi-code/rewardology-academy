import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = fs.readFileSync(path.join(root, "data", "rewardology-dictionary.html"), "utf8");
const a = html.indexOf("<style>") + 7;
const b = html.indexOf("</style>");
let raw = html.slice(a, b).trim();

raw = raw
  .replace(/\*,\*::before,\*::after\{[^}]+\}\n?/g, "")
  .replace(/:root\{[^}]+\}\n?/g, "")
  .replace(/html\{[^}]+\}\n?/g, "")
  .replace(/body\{[^}]+\}\n?/g, "")
  .replace(/^a\{[^}]+\}\n?/gm, "")
  .replace(/^a:hover\{[^}]+\}\n?/gm, "")
  .replace(/^button\{[^}]+\}\n?/gm, "")
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/#search/g, ".srch-wrap input")
  .replace(/#srch-clear/g, ".srch-clear");

function findMatchingBrace(str, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error("Unbalanced braces");
}

function prefixSelectors(selector) {
  return selector
    .split(",")
    .map((s) => {
      const t = s.trim();
      if (!t) return t;
      return `.dict-root ${t}`;
    })
    .join(", ");
}

function transformBlock(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) i++;
    if (i >= css.length) break;

    if (css[i] === "@") {
      const open = css.indexOf("{", i);
      const close = findMatchingBrace(css, open);
      const header = css.slice(i, open + 1);
      const inner = css.slice(open + 1, close);
      out += `${header}${transformBlock(inner)}}`;
      i = close + 1;
      continue;
    }

    const open = css.indexOf("{", i);
    if (open === -1) break;
    const selector = css.slice(i, open).trim();
    const close = findMatchingBrace(css, open);
    const body = css.slice(open + 1, close).trim();
    if (selector) out += `${prefixSelectors(selector)} { ${body} }\n`;
    i = close + 1;
  }
  return out;
}

const header = `/* Total Rewards Dictionary — scoped under .dict-root */
.dict-root {
  --navy: #07192e;
  --navy-card: #0c2540;
  --navy-deep: #051525;
  --navy-panel: #071e36;
  --gold: #c8963e;
  --gold-dim: rgba(200, 150, 62, 0.12);
  --gold-bdr: rgba(200, 150, 62, 0.25);
  --teal: #0c6b65;
  --teal-lit: #0e8a83;
  --text: #e8dcc8;
  --muted: #9b8f7e;
  --dim: #6b6057;
  --bdr: rgba(232, 220, 200, 0.1);
  --r: 6px;
  --serif: var(--font-editorial-serif, "Cormorant Garamond", Georgia, serif);
  --sans: var(--font-editorial-sans, "DM Sans", system-ui, sans-serif);
  box-sizing: border-box;
  background: var(--navy);
  color: var(--text);
  font-family: var(--sans);
  font-size: 15px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}
.dict-root *, .dict-root *::before, .dict-root *::after { box-sizing: border-box; }
.dict-root a { color: var(--gold); text-decoration: none; }
.dict-root a:hover { color: var(--text); }
.dict-root button { cursor: pointer; border: none; background: none; font-family: var(--sans); }
.dict-root .nav-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.dict-root .dict-voice-bar { margin-bottom: 16px; }
`;

fs.writeFileSync(path.join(root, "styles", "dictionary.css"), header + transformBlock(raw));
console.log("Rewrote dictionary.css");
