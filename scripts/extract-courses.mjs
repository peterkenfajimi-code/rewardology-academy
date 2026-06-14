/**
 * Extract COURSES from rewardology-courses-enhanced.html → lib/courses/courseData.ts
 *
 * Usage:
 *   node scripts/extract-courses.mjs
 *   node scripts/extract-courses.mjs path/to/rewardology-courses-enhanced.html
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const DEFAULT_PATHS = [
  path.join(root, "data", "rewardology-courses-enhanced.html"),
  path.join(process.env.USERPROFILE || "", "Downloads", "files (1)", "rewardology-courses-enhanced.html"),
  path.join(process.env.USERPROFILE || "", "Downloads", "rewardology-courses-enhanced.html"),
];

function resolveHtmlPath() {
  if (process.argv[2]) return path.resolve(process.argv[2]);
  for (const p of DEFAULT_PATHS) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("rewardology-courses-enhanced.html not found — pass path as argument");
}

function extractJsLiteral(html, name) {
  const marker = `const ${name} = `;
  const start = html.indexOf(marker);
  if (start === -1) throw new Error(`Missing ${marker} in HTML`);

  let i = start + marker.length;
  while (html[i] === " ") i++;

  const open = html[i];
  const close = open === "[" ? "]" : open === "{" ? "}" : null;
  if (!close) throw new Error(`Expected [ or { after ${name}`);

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let j = i; j < html.length; j++) {
    const c = html[j];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === "\\") escape = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth === 0) return html.slice(i, j + 1);
    }
  }
  throw new Error(`Unclosed literal for ${name}`);
}

function normalizeCourse(raw) {
  const modules = (raw.modules ?? []).map((mod) => ({
    id: mod.id,
    title: mod.title,
    color: mod.color ?? raw.color,
    lessons: (mod.lessons ?? []).map((les) => {
      const lesson = {
        id: les.id,
        title: les.title,
        duration: les.duration ?? "5 min",
        xp: les.xp ?? 0,
        type: les.type === "quiz" ? "quiz" : "lesson",
      };
      if (les.objectives?.length) lesson.objectives = les.objectives;
      if (les.body?.length) lesson.body = les.body;
      if (les.quiz) lesson.quiz = les.quiz;
      if (les.quiz_questions?.length) lesson.quiz_questions = les.quiz_questions;
      if (typeof les.article === "number") lesson.article = les.article;
      return lesson;
    }),
  }));

  const lessonsCount =
    raw.lessons_count ??
    modules.reduce((n, m) => n + m.lessons.filter((l) => l.type === "lesson").length, 0);

  return {
    id: raw.id,
    title: raw.title,
    subtitle: raw.subtitle ?? "",
    color: raw.color,
    color2: raw.color2 ?? raw.color,
    bg: raw.bg ?? "#0C2340",
    icon: raw.icon ?? "◈",
    level: raw.level ?? "Beginner",
    duration: raw.duration ?? "3–4 hours",
    lessons_count: lessonsCount,
    total_xp: raw.total_xp ?? 0,
    desc: raw.desc ?? "",
    outcomes: raw.outcomes ?? [],
    modules,
  };
}

function main() {
  const htmlPath = resolveHtmlPath();
  const outPath = path.join(root, "lib", "courses", "courseData.ts");
  const html = fs.readFileSync(htmlPath, "utf8");
  const raw = JSON.parse(extractJsLiteral(html, "COURSES"));
  const courses = raw.map(normalizeCourse);

  const ts = `export type CourseBlock = {
  t: "intro" | "h" | "p" | "box" | "scenario" | "takeaways" | "quiz_intro";
  v?: string | string[];
  label?: string;
  title?: string;
  org?: string;
  items?: string[];
};

export type KnowledgeQuiz = {
  q: string;
  opts: string[];
  ans: number;
  exp: string;
};

export type CourseLesson = {
  id: string;
  title: string;
  duration: string;
  xp: number;
  type: "lesson" | "quiz";
  objectives?: string[];
  body?: CourseBlock[];
  quiz?: KnowledgeQuiz;
  quiz_questions?: KnowledgeQuiz[];
  /** Linked article id from ESSENTIALS_ARTICLES */
  article?: number;
};

export type CourseModule = {
  id: string;
  title: string;
  color: string;
  lessons: CourseLesson[];
};

export type Course = {
  id: number;
  title: string;
  subtitle: string;
  color: string;
  color2: string;
  bg: string;
  icon: string;
  level: string;
  duration: string;
  lessons_count: number;
  total_xp: number;
  desc: string;
  outcomes: string[];
  modules: CourseModule[];
};

export const COURSES: Course[] = ${JSON.stringify(courses, null, 2)};

export function allLessons(course: Course): { lesson: CourseLesson; mod: CourseModule }[] {
  const out: { lesson: CourseLesson; mod: CourseModule }[] = [];
  course.modules.forEach((m) => m.lessons.forEach((l) => out.push({ lesson: l, mod: m })));
  return out;
}

export function findLesson(courseId: number, lessonId: string) {
  const course = COURSES.find((c) => c.id === courseId);
  if (!course) return null;
  for (const mod of course.modules) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, mod, lesson };
  }
  return null;
}
`;

  fs.writeFileSync(outPath, ts);
  console.log(`Read ${htmlPath}`);
  console.log(`Wrote ${courses.length} courses to ${outPath}`);
  courses.forEach((c) => console.log(`  · ${c.id}. ${c.title} (${c.modules.length} modules, ${c.total_xp} XP)`));
}

main();
