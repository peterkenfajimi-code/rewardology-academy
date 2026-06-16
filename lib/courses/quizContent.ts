import type { CourseLesson, CourseModule, KnowledgeQuiz } from "@/lib/courses/courseData";

const GENERIC_WRONG = [
  "This is not covered in this lesson.",
  "The opposite of what the lesson explains.",
  "This applies only to executive pay programmes.",
] as const;

function takeawaysFrom(lesson: CourseLesson): string[] {
  const block = lesson.body?.find((b) => b.t === "takeaways");
  if (block?.items?.length) return block.items;
  if (Array.isArray(block?.v)) return block.v;
  return [];
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shuffleOptions(correct: string, wrong: string[], seed: string): { opts: string[]; ans: number } {
  const pool = [...new Set([correct, ...wrong.filter((w) => w && w !== correct)])];
  while (pool.length < 4) {
    const filler = GENERIC_WRONG.find((g) => !pool.includes(g));
    if (filler) pool.push(filler);
    else pool.push(`${GENERIC_WRONG[0]} (${pool.length})`);
  }
  const opts = pool.slice(0, 4);
  let state = hashString(seed) || 1;
  for (let i = opts.length - 1; i > 0; i--) {
    state = (state * 1103515245 + 12345) | 0;
    const j = Math.abs(state) % (i + 1);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { opts, ans: opts.indexOf(correct) };
}

function mcqFromStatement(
  prompt: string,
  correct: string,
  wrongPool: string[],
  seed: string,
  exp?: string
): KnowledgeQuiz {
  const { opts, ans } = shuffleOptions(correct, wrongPool, seed);
  return { q: prompt, opts, ans, exp: exp ?? correct };
}

/** Lesson knowledge check — uses embedded quiz or builds from takeaways / objectives. */
export function getLessonQuiz(lesson: CourseLesson): KnowledgeQuiz {
  if (lesson.quiz) return lesson.quiz;

  const takeaways = takeawaysFrom(lesson);
  const objectives = lesson.objectives ?? [];

  if (takeaways.length > 0) {
    return mcqFromStatement(
      `Which statement best reflects a key takeaway from "${lesson.title}"?`,
      takeaways[0],
      [...takeaways.slice(1), ...objectives],
      `${lesson.id}-kc`,
      takeaways[0]
    );
  }

  if (objectives.length > 0) {
    return mcqFromStatement(
      `Which learning objective does "${lesson.title}" address?`,
      objectives[0],
      [...objectives.slice(1), ...GENERIC_WRONG],
      `${lesson.id}-obj`,
      objectives[0]
    );
  }

  return {
    q: `What is the primary focus of the lesson "${lesson.title}"?`,
    opts: [
      `Understanding ${lesson.title.toLowerCase()} in a Total Rewards context.`,
      "Processing payroll transactions only.",
      "Designing executive stock options exclusively.",
      "Replacing all variable pay with fixed salary.",
    ],
    ans: 0,
    exp: `This lesson covers ${lesson.title}.`,
  };
}

function takeawayQuestions(lesson: CourseLesson): KnowledgeQuiz[] {
  const items = takeawaysFrom(lesson);
  if (items.length < 2) return [];

  return items.slice(1).map((item, idx) =>
    mcqFromStatement(
      `${lesson.title} — review question ${idx + 2}:`,
      item,
      [...items.filter((_, i) => i !== idx + 1), ...(lesson.objectives ?? [])],
      `${lesson.id}-ta-${idx}`,
      item
    )
  );
}

/** Module quiz question bank — uses embedded questions or builds from module lessons. */
export function getModuleQuizQuestions(
  quizLesson: CourseLesson,
  mod: CourseModule
): KnowledgeQuiz[] {
  if (quizLesson.quiz_questions?.length) return quizLesson.quiz_questions;

  const lessons = mod.lessons.filter((l) => l.type === "lesson");
  const questions: KnowledgeQuiz[] = [];

  for (const les of lessons) {
    const base = getLessonQuiz(les);
    questions.push({
      ...base,
      q: base.q.startsWith(les.title) ? base.q : `${les.title}: ${base.q}`,
    });
    questions.push(...takeawayQuestions(les));
  }

  let pass = 0;
  while (questions.length < 10 && lessons.length > 0) {
    const les = lessons[pass % lessons.length];
    const base = getLessonQuiz(les);
    questions.push({
      ...base,
      q: `(Review) ${les.title}: ${base.q}`,
    });
    pass += 1;
    if (pass > 24) break;
  }

  return questions.slice(0, 10);
}
