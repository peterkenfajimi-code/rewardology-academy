import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readProjectFile = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const html = readProjectFile("public/toolkit/rewardology-toolkit.html");
const mapSource = readProjectFile("lib/toolkit/toolkitMap.ts");
const courseSource = readProjectFile("lib/courses/courseData.ts");

const navIds = new Set([...html.matchAll(/id="nav-(t\d{2})"/g)].map((match) => match[1]));
const panelIds = new Set([...html.matchAll(/id="panel-(t\d{2})"/g)].map((match) => match[1]));
const colorIds = new Set(
  [...html.matchAll(/(t\d{2}):'#[0-9A-F]{6}'/g)].map((match) => match[1])
);
const mappedEntries = [
  ...mapSource.matchAll(/"(\d+-\d+-\d+)": \{ toolId: "(t\d{2})"/g),
].map((match) => ({ lessonId: match[1], toolId: match[2] }));

const errors = [];
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
  (match) => match[1]
);
for (const script of scripts) {
  try {
    new Function(script);
  } catch (error) {
    errors.push(`Invalid toolkit JavaScript: ${error.message}`);
  }
}
for (let index = 1; index <= 47; index += 1) {
  const toolId = `t${String(index).padStart(2, "0")}`;
  if (!navIds.has(toolId)) errors.push(`Missing navigation item ${toolId}`);
  if (!panelIds.has(toolId)) errors.push(`Missing panel ${toolId}`);
  if (!colorIds.has(toolId)) errors.push(`Missing active colour ${toolId}`);
}
for (const { lessonId, toolId } of mappedEntries) {
  if (!panelIds.has(toolId)) errors.push(`Mapped tool ${toolId} has no panel`);
  if (!courseSource.includes(`"id": "${lessonId}"`)) {
    errors.push(`Mapped lesson ${lessonId} does not exist`);
  }
}

if (errors.length) {
  throw new Error(errors.join("\n"));
}

console.log(
  `Validated ${panelIds.size} tool panels, ${navIds.size} navigation items, ${mappedEntries.length} lesson links, and ${scripts.length} script.`
);
