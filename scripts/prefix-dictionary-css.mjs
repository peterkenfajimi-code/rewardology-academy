import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(root, "styles", "dictionary.css");
let css = fs.readFileSync(file, "utf8");

const headerEnd = css.indexOf("/* ── Nav");
const header = css.slice(0, headerEnd);
let body = css.slice(headerEnd);

body = body.replace(/^(\s*)\.(?!dict-root)([^\s{,]+)/gm, "$1.dict-root .$2");
body = body.replace(/,\s*\.(?!dict-root)([^\s{,]+)/g, ", .dict-root .$1");

fs.writeFileSync(file, header + body);
console.log("Prefixed dictionary.css selectors");
