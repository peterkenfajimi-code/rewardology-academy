/**
 * Merge the Courses 16–20 all-in-one HTML into the Next.js data modules
 * and append toolkit tools t48–t62 to the live practitioner toolkit.
 *
 *   node scripts/integrate-courses-c16-c20.mjs [handoff-html]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.resolve(
  process.argv[2] || "C:\\Users\\pfajimi\\Downloads\\rewardology-all-in-one.html"
);

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

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function firstSentence(value) {
  return String(value).match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? String(value);
}

function htmlToText(html) {
  return String(html ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function letterIndex(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const raw = String(value ?? "").trim().toLowerCase();
  if (/^[a-d]$/.test(raw)) return raw.charCodeAt(0) - 97;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionTexts(options) {
  return (options ?? []).map((option) => (typeof option === "string" ? option : option.text));
}

function courseLessonId(value) {
  const raw = String(value);
  const moduleLesson = raw.match(/^c(\d+)-m(\d+)-([tpqc])$/i);
  if (moduleLesson) {
    const slot = { t: "1", p: "2", c: "3", q: "Q" }[moduleLesson[3].toLowerCase()];
    return `${moduleLesson[1]}-${moduleLesson[2]}-${slot}`;
  }
  const capstone = raw.match(/^c(\d+)-cap(?:-([lq]))?$/i);
  if (capstone) {
    if (!capstone[2] || capstone[2].toLowerCase() === "l") return `${capstone[1]}-cap`;
    return `${capstone[1]}-cap-Q`;
  }
  return raw.replace(/^c(\d+)-m(\d+)-l(\d+)$/i, "$1-$2-$3").replace(/^c(\d+)-m(\d+)-q$/i, "$1-$2-Q");
}

function moduleId(raw, courseId, index, lessonCount) {
  if (raw) return String(raw).replace(/^c(\d+)-m(\d+)$/i, "$1-$2");
  const looksLikeCapstone = index >= 4 || lessonCount <= 2;
  return looksLikeCapstone && index === (lessonCount <= 2 ? index : 4) && index >= 4
    ? `c${courseId}-cap`
    : `${courseId}-${index + 1}`;
}

function durationFor(lesson) {
  if (lesson.duration) return lesson.duration;
  if (lesson.kind === "quiz" || lesson.tag === "QUIZ") return "15 min";
  if (lesson.tag === "CAPSTONE") return "20 min";
  return "10 min";
}

function normalizeQuestion(question) {
  return {
    q: question.q ?? question.stem ?? question.text,
    opts: optionTexts(question.opts ?? question.options),
    ans: letterIndex(question.ans ?? question.correct),
    exp: question.exp ?? question.reason ?? question.explanation ?? "",
  };
}

function blockText(block) {
  return block.body ?? block.t ?? block.v ?? "";
}

function revealLabel(block) {
  const label = String(block.trigger ?? block.label ?? "See the reasoning").trim();
  const step = label.match(/^step\s+(\d+)/i);
  if (step) return `Reveal Step ${step[1]}`;
  if (/^reveal /i.test(label) || /^see the reasoning$/i.test(label)) return label;
  return `Reveal ${label}`;
}

function normalizeBlock(block, discussionIndex = 0, lessonTitle = "") {
  const type = block.type || block.k;
  if (type === "intro") return { t: "intro", v: blockText(block) };
  if (type === "p") return { t: "p", v: blockText(block) };
  if (type === "h2" || type === "section") {
    return [
      { t: "h", v: block.title ?? block.label ?? "Section" },
      block.body ? { t: "p", v: block.body } : null,
    ].filter(Boolean);
  }
  if (type === "box" || type === "callout") {
    const label = block.label ?? block.title ?? "Note";
    if (/^case study$/i.test(label)) {
      return {
        t: "scenario",
        label: "Case Background",
        title:
          (lessonTitle || block.title || "")
            .replace(/\s*[—–-]\s*Case Analysis$/i, "")
            .trim() || "Case Background",
        v: blockText(block),
      };
    }
    return { t: "box", label, v: blockText(block) };
  }
  if (type === "scenario") {
    return {
      t: "scenario",
      label: block.label ?? "Case Background",
      title: block.title,
      org: block.org,
      v: blockText(block),
    };
  }
  if (type === "reveal") {
    return { t: "reveal", label: revealLabel(block), v: blockText(block) };
  }
  if (type === "discussion") {
    const heading = /^discussion point/i.test(block.title ?? "")
      ? block.title
      : `Discussion Point ${discussionIndex}`;
    return [
      { t: "h", v: heading },
      block.prompt ? { t: "p", v: block.prompt } : null,
      { t: "reveal", label: "See the reasoning", v: block.body ?? "" },
    ].filter(Boolean);
  }
  if (type === "takeaways") return { t: "takeaways", items: block.items ?? [] };
  return null;
}

function flattenBlocks(blocks, lessonTitle = "") {
  let discussionIndex = 0;
  return blocks.flatMap((block) => {
    const type = block.type || block.k;
    if (type === "discussion") discussionIndex += 1;
    const normalized = normalizeBlock(block, discussionIndex, lessonTitle);
    if (!normalized) return [];
    return Array.isArray(normalized) ? normalized : [normalized];
  });
}

function normalizeCourse(raw) {
  const id = numericId(raw.id);
  const modules = (raw.modules ?? []).map((mod, moduleIndex) => {
    const lessons = (mod.lessons ?? []).map((lesson) => {
      const isQuiz = lesson.kind === "quiz" || lesson.tag === "QUIZ" || lesson.type === "quiz";
      const blocks = lesson.blocks ?? lesson.body ?? [];
      const knowledgeCheck = (Array.isArray(blocks) ? blocks : []).find(
        (block) => block.type === "question" || block.k === "check"
      );
      const normalized = {
        id: courseLessonId(lesson.id),
        title: lesson.title.replace(/^Module \d+ Quiz:\s*/i, "Module Quiz: "),
        duration: durationFor(lesson),
        xp: lesson.xp ?? 0,
        type: isQuiz ? "quiz" : "lesson",
      };
      const body = Array.isArray(blocks)
        ? flattenBlocks(
            blocks.filter((block) => block.type !== "question"),
            lesson.title
          )
        : [];
      if (body.length) normalized.body = body;
      if (lesson.objectives?.length) normalized.objectives = lesson.objectives;
      if (knowledgeCheck) normalized.quiz = normalizeQuestion(knowledgeCheck);
      if (isQuiz && Array.isArray(lesson.quiz)) {
        normalized.quiz_questions = lesson.quiz.map(normalizeQuestion);
      }
      return normalized;
    });
    const isCapstone = lessons.some((lesson) => lesson.id.endsWith("-cap") || lesson.id.includes("-cap-"));
    return {
      id: isCapstone ? `c${id}-cap` : `${id}-${moduleIndex + 1}`,
      title: String(mod.title ?? "").replace(/^Module \d+\s*[:·]\s*/i, ""),
      color: mod.color ?? raw.color,
      lessons,
    };
  });

  return {
    id,
    title: raw.title,
    subtitle: raw.subtitle ?? "",
    color: raw.color,
    color2: raw.color2 ?? raw.color,
    bg: raw.bg ?? "#0C2340",
    icon: raw.icon ?? "◈",
    level: raw.level ?? "Advanced",
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

const COURSE_ARTICLE_CAT = {
  16: "Reward Strategy",
  17: "Workforce Planning",
  18: "Recognition",
  19: "Startups",
  20: "Compensation Governance",
};

function htmlToParagraphs(html) {
  return htmlToText(String(html ?? "").replace(/<h2[^>]*>[\s\S]*?<\/h2>/gi, "\n\n"))
    .split(/\n\n+/)
    .map((paragraph) => paragraph.replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

function normalizeArticle(raw, courses) {
  const id = numericId(raw.id);
  const courseId = numericId(raw.course ?? raw.courseId);
  const course = courses.find((item) => item.id === courseId);
  const category = COURSE_ARTICLE_CAT[courseId] ?? raw.cat ?? course?.title ?? "Total Rewards";
  const paragraphs = raw.paragraphs?.length ? raw.paragraphs : htmlToParagraphs(raw.body ?? "");
  const intro = paragraphs[0] ?? "";
  const bodyParagraphs = paragraphs.slice(1);
  const headings = [
    "The Core Design Challenge",
    "How the Approach Works",
    "Governance and Implementation",
    "Putting It Into Practice",
  ];
  const sectionCount = Math.min(4, Math.max(1, Math.ceil(bodyParagraphs.length / 3)));
  const chunkSize = Math.max(1, Math.ceil(bodyParagraphs.length / sectionCount));
  const sections = Array.from({ length: sectionCount }, (_, index) => ({
    h2: headings[index],
    body: bodyParagraphs.slice(index * chunkSize, (index + 1) * chunkSize).join("\n\n"),
  })).filter((section) => section.body);
  const readTime = typeof raw.readTime === "number" ? `${raw.readTime} min` : raw.readTime ?? "8 min";

  return {
    id,
    slug: slugify(raw.title),
    num: String(id).padStart(2, "0"),
    color: raw.color ?? course?.color ?? "#C8963E",
    category,
    catKey: slugify(category),
    title: raw.title,
    subtitle: `A practitioner guide to ${String(category).toLowerCase()}`,
    description: intro.length > 190 ? `${intro.slice(0, 187).trimEnd()}…` : intro,
    readTime,
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
    quiz: category,
  };
}

function normalizeQuiz(raw, courses) {
  const course = courses.find((item) => item.id === numericId(raw.course ?? raw.courseId));
  return {
    id: numericId(raw.id),
    title: raw.title,
    category: raw.title,
    color: raw.color ?? course?.color ?? "#C8963E",
    bg: "#0C2340",
    icon: "◈",
    xp: raw.xp ?? 150,
    desc: raw.desc ?? `Test your practical knowledge of ${raw.title.toLowerCase()}.`,
    questions: (raw.questions ?? []).map(normalizeQuestion),
  };
}

function mergeById(existing, additions) {
  const additionIds = new Set(additions.map((item) => item.id));
  return [...existing.filter((item) => !additionIds.has(item.id)), ...additions].sort((a, b) => a.id - b.id);
}

function extractBetween(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start < 0) throw new Error(`Missing start marker: ${startMarker}`);
  const end = text.indexOf(endMarker, start);
  if (end < 0) throw new Error(`Missing end marker: ${endMarker}`);
  return text.slice(start, end);
}

function mergeToolkit(existingHtml, sourceHtml) {
  const navStart = sourceHtml.indexOf("Course 16 · Reward Strategy");
  const navGroupStart = sourceHtml.lastIndexOf('<div class="sb-group">', navStart);
  const navNeedle = "Pay Transparency Readiness (Adv.)</div></div>";
  const navEnd = sourceHtml.indexOf(navNeedle, navGroupStart);
  if (navGroupStart < 0 || navEnd < 0) {
    throw new Error("Could not extract Course 16–20 toolkit navigation");
  }
  const navHtml = sourceHtml.slice(navGroupStart, navEnd + navNeedle.length);

  const panelStart = sourceHtml.indexOf("<!-- ═══════════════ t48");
  const panelResult = sourceHtml.indexOf('id="ptr2-result"', panelStart);
  if (panelStart < 0 || panelResult < 0) {
    throw new Error("Could not extract Course 16–20 toolkit panels");
  }
  const panelClose = sourceHtml.indexOf("</div>", panelResult);
  const panelHtml = sourceHtml.slice(panelStart, panelClose + "</div>".length);

  const jsHtml = extractBetween(
    sourceHtml,
    "// ──────────────────── t48:",
    "// ──────────────────── Show-tool hook"
  ).trim();

  let html = existingHtml;
  if (!html.includes("--c16:")) {
    html = html.replace(
      "--c15:#6B3A2A;",
      "--c15:#6B3A2A;--c16:#1B5E94;--c17:#5C4B8A;--c18:#2D8B6B;--c19:#C4821A;--c20:#3D5A3E;"
    );
  }
  if (!html.includes('id="nav-t48"')) {
    const t47 = html.indexOf('id="nav-t47"');
    const sidebarClose = html.indexOf("</div>", html.indexOf("Integration Comms Planner", t47));
    // Close the Course 15 group, then the sidebar wrapper.
    const groupClose = html.indexOf("</div>", sidebarClose + 1);
    if (t47 < 0 || groupClose < 0) throw new Error("Could not find toolkit sidebar insertion point");
    html = `${html.slice(0, groupClose + 6)}${navHtml}${html.slice(groupClose + 6)}`;
  }
  if (!html.includes('id="panel-t48"')) {
    const toast = html.indexOf('<div id="toast"></div>');
    const mainClose = html.lastIndexOf("</div>", toast);
    if (toast < 0 || mainClose < 0) throw new Error("Could not find toolkit panel insertion point");
    html = `${html.slice(0, mainClose)}${panelHtml}\n${html.slice(mainClose)}`;
  }
  html = html.replace(
    /const ACTIVE_COLORS=\{[^;]+\};/,
    "const ACTIVE_COLORS={t01:'#C8963E',t02:'#C8963E',t03:'#0C6B65',t04:'#0C6B65',t05:'#0C6B65',t06:'#0C6B65',t07:'#6B4C9A',t08:'#6B4C9A',t09:'#6B4C9A',t10:'#6B4C9A',t11:'#B84B4B',t12:'#B84B4B',t13:'#B84B4B',t14:'#3A7D44',t15:'#3A7D44',t16:'#3A7D44',t17:'#3A7D44',t18:'#0C6B65',t19:'#0C6B65',t20:'#0C6B65',t21:'#0C6B65',t22:'#6B4C9A',t23:'#6B4C9A',t24:'#6B4C9A',t25:'#6B4C9A',t26:'#B84B4B',t27:'#B84B4B',t28:'#3A7D44',t29:'#3A7D44',t30:'#3A7D44',t31:'#C8963E',t32:'#C8963E',t33:'#2D6A9F',t34:'#2D6A9F',t35:'#2D6A9F',t36:'#7B3FA0',t37:'#7B3FA0',t38:'#7B3FA0',t39:'#1A7A4A',t40:'#1A7A4A',t41:'#1A7A4A',t42:'#C25B20',t43:'#C25B20',t44:'#C25B20',t45:'#6B3A2A',t46:'#6B3A2A',t47:'#6B3A2A',t48:'#1B5E94',t49:'#1B5E94',t50:'#1B5E94',t51:'#5C4B8A',t52:'#5C4B8A',t53:'#5C4B8A',t54:'#2D8B6B',t55:'#2D8B6B',t56:'#2D8B6B',t57:'#C4821A',t58:'#C4821A',t59:'#C4821A',t60:'#3D5A3E',t61:'#3D5A3E',t62:'#3D5A3E'};"
  );
  if (!html.includes("function calcRSM()")) {
    html = html.replace("</script>", `\n${jsHtml}\n</script>`);
  }
  if (!html.includes('id="nav-t48"') || !html.includes('id="panel-t48"')) {
    throw new Error("Toolkit merge did not insert Course 16–20 navigation or panels");
  }
  return html;
}

const TOOLKIT_LINKS = [
  ["16-1-2", "t48", "Open: Reward Strategy Maturity Scorer"],
  ["16-2-2", "t49", "Open: Business Case ROI Calculator"],
  ["16-3-2", "t50", "Open: SCQA Presentation Builder"],
  ["17-1-2", "t52", "Open: Workforce Scenario Cost Modeller"],
  ["17-2-2", "t51", "Open: Employment Cost Calculator"],
  ["17-4-2", "t53", "Open: Redundancy Cost & Payback Calculator"],
  ["18-2-2", "t54", "Open: Recognition Programme Designer"],
  ["18-3-2", "t56", "Open: Non-Financial Reward Audit"],
  ["18-4-2", "t55", "Open: EVP Diagnostic"],
  ["19-1-2", "t57", "Open: Startup Compensation Benchmarker"],
  ["19-2-2", "t58", "Open: EMI Option Pool Calculator"],
  ["19-3-2", "t59", "Open: Scaling Pay Structure Planner"],
  ["20-2-2", "t60", "Open: ESG Pay Metric Selector"],
  ["20-3-2", "t61", "Open: Board Reward Report Builder"],
  ["20-4-2", "t62", "Open: Pay Transparency Readiness — Advanced"],
];

const source = fs.readFileSync(sourcePath, "utf8");

const courseDataPath = path.join(root, "lib", "courses", "courseData.ts");
let courseData = fs.readFileSync(courseDataPath, "utf8");
const existingCourses = parseLiteral(courseData, "export const COURSES: Course[] =");
const rawCourses = parseLiteral(source, "const COURSES =");
const newCourses = rawCourses
  .filter((course) => {
    const id = numericId(course.id);
    return id >= 16 && id <= 20;
  })
  .map(normalizeCourse);
if (newCourses.length !== 5) {
  throw new Error(`Expected courses 16–20, found ${newCourses.map((course) => course.id).join(", ")}`);
}
courseData = replaceLiteral(courseData, "export const COURSES: Course[] =", mergeById(existingCourses, newCourses));
fs.writeFileSync(courseDataPath, courseData);

const rawArticles = parseLiteral(source, "const ARTICLES_C16_C20 =");
const newArticles = rawArticles.map((article) => normalizeArticle(article, newCourses));

const articlesPath = path.join(root, "lib", "articles", "essentials.ts");
let articlesData = fs.readFileSync(articlesPath, "utf8");
const existingArticles = parseLiteral(articlesData, "export const ESSENTIALS_ARTICLES: EssentialArticle[] =");
articlesData = replaceLiteral(
  articlesData,
  "export const ESSENTIALS_ARTICLES: EssentialArticle[] =",
  mergeById(existingArticles, newArticles)
);
articlesData = replaceLiteral(articlesData, "export const ESSENTIALS_TOPICS =", [
  "Total Rewards Fundamentals",
  "Compensation & Benefits",
  "Compensation Design",
  "Pay Equity",
  "Job Evaluation",
  "Market Pay",
  "Compensation Analytics",
  "Benefits Management",
  "Incentives",
  "Pay Transparency",
  "EVP",
  "Career Development",
  "Compensation Governance",
  "Trends",
  "Rewards Communication",
  "Benefits Operations",
  "Performance & Rewards",
  "Compensation Planning",
  "Executive Rewards",
  "Global Rewards",
  "Recognition",
  "Wellbeing",
  "Rewards Analytics",
  "Employee Education",
]);
fs.writeFileSync(articlesPath, articlesData);

const rawQuizzes = parseLiteral(source, "const QUIZZES_C16_C20 =");
const newQuizzes = rawQuizzes.map((quiz) => normalizeQuiz(quiz, newCourses));
const quizzesPath = path.join(root, "lib", "quizzes", "quizCentre.ts");
let quizzesData = fs.readFileSync(quizzesPath, "utf8");
const existingQuizzes = parseLiteral(quizzesData, "export const QUIZ_CENTRE: QuizCentreQuiz[] =");
quizzesData = replaceLiteral(
  quizzesData,
  "export const QUIZ_CENTRE: QuizCentreQuiz[] =",
  mergeById(existingQuizzes, newQuizzes)
);
fs.writeFileSync(quizzesPath, quizzesData);

const toolkitMapPath = path.join(root, "lib", "toolkit", "toolkitMap.ts");
let toolkitMap = fs.readFileSync(toolkitMapPath, "utf8");
for (const [lessonId, toolId, label] of TOOLKIT_LINKS) {
  if (!toolkitMap.includes(`"${lessonId}"`)) {
    toolkitMap = toolkitMap.replace(
      "};\r\n\r\nexport const TOOLKIT_HTML_PATH",
      `  "${lessonId}": { toolId: "${toolId}", label: "${label}" },\n};\n\nexport const TOOLKIT_HTML_PATH`
    );
    if (!toolkitMap.includes(`"${lessonId}"`)) {
      toolkitMap = toolkitMap.replace(
        "};\n\nexport const TOOLKIT_HTML_PATH",
        `  "${lessonId}": { toolId: "${toolId}", label: "${label}" },\n};\n\nexport const TOOLKIT_HTML_PATH`
      );
    }
  }
}
fs.writeFileSync(toolkitMapPath, toolkitMap);

const toolkitPath = path.join(root, "public", "toolkit", "rewardology-toolkit.html");
const toolkitHtml = fs.readFileSync(toolkitPath, "utf8");
fs.writeFileSync(toolkitPath, mergeToolkit(toolkitHtml, source));

const validatePath = path.join(root, "scripts", "validate-toolkit.mjs");
if (fs.existsSync(validatePath)) {
  const validate = fs.readFileSync(validatePath, "utf8").replace(
    "for (let index = 1; index <= 47; index += 1)",
    "for (let index = 1; index <= 62; index += 1)"
  );
  fs.writeFileSync(validatePath, validate);
}

console.log(
  `Integrated ${newCourses.length} courses, ${newArticles.length} articles, ${newQuizzes.length} quizzes, and 15 toolkit tools.`
);
