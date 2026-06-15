import { maxArticleXp } from "@/lib/articles/progress";
import { COURSES } from "@/lib/courses/courseData";
import {
  DICTIONARY_TERM_COUNT,
  DICTIONARY_XP_PER_TERM,
} from "@/lib/dictionary/terms";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";

export const MAX_COURSE_XP_PLATFORM = COURSES.reduce((s, c) => s + c.total_xp, 0);
export const MAX_QUIZ_XP_PLATFORM = QUIZ_CENTRE.reduce((s, q) => s + q.xp, 0);
export const MAX_ARTICLE_XP_PLATFORM = maxArticleXp();
export const MAX_DICTIONARY_XP_PLATFORM = DICTIONARY_TERM_COUNT * DICTIONARY_XP_PER_TERM;
export const MAX_PLATFORM_XP =
  MAX_COURSE_XP_PLATFORM +
  MAX_QUIZ_XP_PLATFORM +
  MAX_ARTICLE_XP_PLATFORM +
  MAX_DICTIONARY_XP_PLATFORM;

export const PLATFORM_LESSON_COUNT = COURSES.reduce((s, c) => s + c.lessons_count, 0);
export const PLATFORM_QUIZ_QUESTIONS = QUIZ_CENTRE.reduce(
  (s, q) => s + q.questions.length,
  0
);
