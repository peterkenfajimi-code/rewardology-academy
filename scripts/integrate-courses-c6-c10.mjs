/**
 * Merge a course-batch handoff HTML into the Next.js data modules.
 *
 * Usage:
 *   node scripts/integrate-courses-c6-c10.mjs <courses-html> [toolkit-html]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [sourceArg, toolkitArg] = process.argv.slice(2);

if (!sourceArg) {
  throw new Error("Pass the courses handoff HTML path");
}

function extractLiteral(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`Missing marker: ${marker}`);
  let i = start + marker.length;
  while (/\s/.test(text[i])) i += 1;
  const open = text[i];
  const close = open === "[" ? "]" : open === "{" ? "}" : null;
  if (!close) throw new Error(`Expected an array or object after: ${marker}`);

  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let j = i; j < text.length; j += 1) {
    const char = text[j];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quote) {
      if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === open) depth += 1;
    if (char === close && --depth === 0) {
      return { literal: text.slice(i, j + 1), start: i, end: j + 1 };
    }
  }
  throw new Error(`Unclosed literal after: ${marker}`);
}

function parseLiteral(text, marker) {
  const { literal } = extractLiteral(text, marker);
  try {
    return JSON.parse(literal);
  } catch {
    return new Function(`return (${literal})`)();
  }
}

function replaceLiteral(text, marker, value) {
  const current = extractLiteral(text, marker);
  return `${text.slice(0, current.start)}${JSON.stringify(value, null, 2)}${text.slice(current.end)}`;
}

function numericId(value) {
  return Number(String(value).replace(/^\D+/, ""));
}

function courseLessonId(value) {
  return String(value)
    .replace(/^c(\d+)-m(\d+)-l(\d+)$/i, "$1-$2-$3")
    .replace(/^c(\d+)-m(\d+)-q$/i, "$1-$2-Q");
}

function moduleId(value, courseId, index) {
  if (!value) return index < 4 ? `${courseId}-${index + 1}` : `c${courseId}-cap`;
  return String(value).replace(/^c(\d+)-m(\d+)$/i, "$1-$2");
}

function normalizeQuestion(question) {
  return {
    q: question.q,
    opts: question.opts,
    ans: question.ans ?? question.correct,
    exp: question.exp ?? question.reason,
  };
}

function normalizeBlock(block) {
  if (block.k === "intro") return { t: "intro", v: block.t };
  if (block.k === "h2") return { t: "h", v: block.t };
  if (block.k === "p") return { t: "p", v: block.t };
  if (block.k === "box") {
    return { t: "box", label: block.label, v: block.body };
  }
  if (block.k === "scenario") {
    return {
      t: "scenario",
      label: block.label,
      title: block.title,
      org: block.org,
      v: block.body,
    };
  }
  if (block.k === "reveal") {
    return { t: "reveal", label: block.trigger ?? block.label, v: block.body };
  }
  if (block.k === "takeaways") return { t: "takeaways", items: block.items };
  return null;
}

function normalizeCourse(raw) {
  const id = numericId(raw.id);
  const modules = (raw.modules ?? []).map((mod, moduleIndex) => ({
    id: moduleId(mod.id, id, moduleIndex),
    title: mod.title,
    color: mod.color ?? raw.color,
    lessons: (mod.lessons ?? []).map((lesson) => {
      const isQuiz = lesson.type === "quiz";
      const blocks = lesson.body ?? lesson.blocks ?? [];
      const knowledgeCheck = blocks.find((block) => block.k === "check");
      const normalized = {
        id: courseLessonId(lesson.id),
        title: lesson.title,
        duration: lesson.duration ?? (isQuiz ? "15 min" : "10 min"),
        xp: lesson.xp ?? 0,
        type: isQuiz ? "quiz" : "lesson",
      };
      const body = lesson.body ?? blocks.map(normalizeBlock).filter(Boolean);
      if (body.length) normalized.body = body;
      if (lesson.objectives?.length) normalized.objectives = lesson.objectives;
      if (knowledgeCheck) normalized.quiz = normalizeQuestion(knowledgeCheck);
      if (isQuiz && Array.isArray(lesson.quiz)) {
        normalized.quiz_questions = lesson.quiz.map(normalizeQuestion);
      } else if (lesson.quiz && !Array.isArray(lesson.quiz)) {
        normalized.quiz = normalizeQuestion(lesson.quiz);
      }
      if (lesson.quiz_questions?.length) {
        normalized.quiz_questions = lesson.quiz_questions.map(normalizeQuestion);
      }
      if (typeof lesson.article === "string") normalized.article = numericId(lesson.article);
      else if (typeof lesson.article === "number") normalized.article = lesson.article;
      return normalized;
    }),
  }));

  return {
    id,
    title: raw.title,
    subtitle: raw.subtitle ?? "",
    color: raw.color,
    color2: raw.color2 ?? raw.color,
    bg: raw.bg ?? "#0C2340",
    icon: raw.icon ?? "◈",
    level: raw.level ?? "Intermediate",
    duration: raw.duration ?? "4 hours",
    lessons_count: raw.lessons_count ?? modules.reduce((count, mod) => count + mod.lessons.length, 0),
    total_xp:
      raw.total_xp ??
      modules.reduce(
        (courseXp, mod) => courseXp + mod.lessons.reduce((moduleXp, lesson) => moduleXp + (lesson.xp ?? 0), 0),
        0
      ),
    desc: raw.desc ?? raw.subtitle ?? "",
    outcomes: raw.outcomes ?? [],
    pro: raw.pro === true,
    modules,
  };
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstSentence(value) {
  return value.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? value;
}

function normalizeArticle(raw, courses) {
  const id = numericId(raw.id);
  const paragraphs = raw.paragraphs ?? [];
  const intro = paragraphs[0] ?? "";
  const bodyParagraphs = paragraphs.slice(1);
  const sectionCount = Math.min(4, Math.max(1, Math.ceil(bodyParagraphs.length / 3)));
  const chunkSize = Math.max(1, Math.ceil(bodyParagraphs.length / sectionCount));
  const headings = [
    "The Core Design Challenge",
    "How the Approach Works",
    "Governance and Implementation",
    "Putting It Into Practice",
  ];
  const sections = Array.from({ length: sectionCount }, (_, index) => ({
    h2: headings[index],
    body: bodyParagraphs.slice(index * chunkSize, (index + 1) * chunkSize).join("\n\n"),
  })).filter((section) => section.body);
  const course = courses.find((item) => item.id === numericId(raw.courseId));

  return {
    id,
    slug: slugify(raw.title),
    num: String(id).padStart(2, "0"),
    color: raw.color ?? course?.color ?? "#C8963E",
    category: raw.cat ?? course?.title ?? "Total Rewards",
    catKey: slugify(raw.cat ?? course?.title ?? "total-rewards"),
    title: raw.title,
    subtitle: raw.subtitle ?? `A practitioner guide to ${String(raw.cat ?? "Total Rewards").toLowerCase()}`,
    description: intro.length > 190 ? `${intro.slice(0, 187).trimEnd()}…` : intro,
    readTime: raw.readTime ?? "8 min",
    xp: raw.xp ?? 15,
    intro,
    toc: sections.map((section) => section.h2),
    sections,
    scenario: null,
    mistakes: [],
    practical: null,
    pullquote: "",
    closingNote: "",
    takeaways: paragraphs.slice(-3).map(firstSentence),
    related: [],
    course: course?.title ?? "",
    quiz: raw.cat ?? "",
  };
}

function normalizeQuiz(raw) {
  return {
    id: numericId(raw.id),
    title: raw.title,
    category: raw.title,
    color: raw.color ?? "#C8963E",
    bg: "#0C2340",
    icon: "◈",
    xp: raw.xp ?? 150,
    desc: raw.desc ?? `Test your practical knowledge of ${raw.title.toLowerCase()}.`,
    questions: (raw.questions ?? []).map((question) => ({
      q: question.q,
      opts: question.opts,
      ans: question.ans ?? question.correct,
      exp: question.exp ?? question.reason,
    })),
  };
}

function mergeById(existing, additions) {
  const additionIds = new Set(additions.map((item) => item.id));
  return [...existing.filter((item) => !additionIds.has(item.id)), ...additions].sort((a, b) => a.id - b.id);
}

const sourcePath = path.resolve(sourceArg);
const source = fs.readFileSync(sourcePath, "utf8");

const courseDataPath = path.join(root, "lib", "courses", "courseData.ts");
let courseData = fs.readFileSync(courseDataPath, "utf8");
const existingCourses = parseLiteral(courseData, "export const COURSES: Course[] =");
const existingCourseIds = new Set(existingCourses.map((course) => course.id));
const rawCourses = parseLiteral(source, "const COURSES =");
const newCourses = rawCourses
  .filter((course) => !existingCourseIds.has(numericId(course.id)))
  .map(normalizeCourse);
if (!newCourses.length) throw new Error("The handoff contains no courses that are not already integrated");
const firstCourseId = Math.min(...newCourses.map((course) => course.id));
const lastCourseId = Math.max(...newCourses.map((course) => course.id));
const batchSuffix = `C${firstCourseId}_C${lastCourseId}`;

courseData = replaceLiteral(courseData, "export const COURSES: Course[] =", mergeById(existingCourses, newCourses));
courseData = courseData.replace(
  /  modules: CourseModule\[\];\r?\n};/,
  "  modules: CourseModule[];\n  pro?: boolean;\n};"
);
fs.writeFileSync(courseDataPath, courseData);

const rawArticles = parseLiteral(source, `const NEW_ARTICLES_${batchSuffix} =`);
const newArticles = rawArticles.map((article) => normalizeArticle(article, newCourses));
if (!newArticles.length) throw new Error(`No articles found for ${batchSuffix}`);

const articlesPath = path.join(root, "lib", "articles", "essentials.ts");
let articlesData = fs.readFileSync(articlesPath, "utf8");
const existingArticles = parseLiteral(articlesData, "export const ESSENTIALS_ARTICLES: EssentialArticle[] =");
articlesData = replaceLiteral(
  articlesData,
  "export const ESSENTIALS_ARTICLES: EssentialArticle[] =",
  mergeById(existingArticles, newArticles)
);
articlesData = articlesData
  .replace("  scenario: { title: string; body: string };", "  scenario: { title: string; body: string } | null;")
  .replace("  practical: { title: string; steps: string[] };", "  practical: { title: string; steps: string[] } | null;");
fs.writeFileSync(articlesPath, articlesData);

const rawQuizzes = parseLiteral(source, `const NEW_QUIZZES_${batchSuffix} =`);
const newQuizzes = rawQuizzes.map(normalizeQuiz);
if (!newQuizzes.length) throw new Error(`No quizzes found for ${batchSuffix}`);

const quizzesPath = path.join(root, "lib", "quizzes", "quizCentre.ts");
let quizzesData = fs.readFileSync(quizzesPath, "utf8");
const existingQuizzes = parseLiteral(quizzesData, "export const QUIZ_CENTRE: QuizCentreQuiz[] =");
quizzesData = replaceLiteral(
  quizzesData,
  "export const QUIZ_CENTRE: QuizCentreQuiz[] =",
  mergeById(existingQuizzes, newQuizzes)
);
fs.writeFileSync(quizzesPath, quizzesData);

console.log(`Integrated ${newCourses.length} courses, ${newArticles.length} articles, and ${newQuizzes.length} quizzes.`);
if (toolkitArg) {
  const toolkitPath = path.resolve(toolkitArg);
  const toolkitTarget = path.join(root, "public", "toolkit", "rewardology-toolkit.html");
  fs.copyFileSync(toolkitPath, toolkitTarget);
  console.log(`Installed toolkit: ${toolkitTarget}`);
}
