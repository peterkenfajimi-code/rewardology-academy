import { DAILY_QUIZ_XP } from "@/lib/daily-quiz/dailyQuizData";
import { DICTIONARY_XP_PER_TERM } from "@/lib/dictionary/terms";
import {
  MAX_ARTICLE_XP_PLATFORM,
  MAX_COURSE_XP_PLATFORM,
  MAX_DICTIONARY_XP_PLATFORM,
  MAX_QUIZ_XP_PLATFORM,
  PLATFORM_LESSON_COUNT,
} from "@/lib/xp/platformMax";

export const COMIC_XP_PER_ISSUE = 25;

export type XpEarnRate = {
  label: string;
  xp: number;
  unit: string;
  max: number | null;
};

export const XP_EARN_RATES: XpEarnRate[] = [
  {
    label: "Course Lesson",
    xp:
      PLATFORM_LESSON_COUNT > 0
        ? Math.round(MAX_COURSE_XP_PLATFORM / PLATFORM_LESSON_COUNT)
        : 135,
    unit: "per lesson",
    max: MAX_COURSE_XP_PLATFORM,
  },
  { label: "Article", xp: 15, unit: "per article", max: MAX_ARTICLE_XP_PLATFORM },
  { label: "Quiz", xp: 150, unit: "per quiz", max: MAX_QUIZ_XP_PLATFORM },
  {
    label: "Dictionary",
    xp: DICTIONARY_XP_PER_TERM,
    unit: "per term",
    max: MAX_DICTIONARY_XP_PLATFORM,
  },
  { label: "Comics Issue", xp: COMIC_XP_PER_ISSUE, unit: "per issue", max: null },
  { label: "Daily Quiz", xp: DAILY_QUIZ_XP, unit: "per day", max: null },
];

export type XpSourceKey =
  | "courses"
  | "articles"
  | "quizzes"
  | "dictionary"
  | "comics"
  | "daily";

export type XpSources = Record<XpSourceKey, number>;

export const XP_SOURCE_LABELS: Record<XpSourceKey, string> = {
  courses: "Courses",
  articles: "Articles",
  quizzes: "Quizzes",
  dictionary: "Dictionary",
  comics: "Comics",
  daily: "Daily Quizzes",
};

export const XP_SOURCE_MAX: Partial<Record<XpSourceKey, number>> = {
  courses: MAX_COURSE_XP_PLATFORM,
  articles: MAX_ARTICLE_XP_PLATFORM,
  quizzes: MAX_QUIZ_XP_PLATFORM,
  dictionary: MAX_DICTIONARY_XP_PLATFORM,
};

export function sumXpSources(sources: XpSources): number {
  return Object.values(sources).reduce((s, v) => s + v, 0);
}

export function moduleFillPct(key: XpSourceKey, value: number): number | null {
  const max = XP_SOURCE_MAX[key];
  if (max == null || max <= 0) return null;
  return Math.min((value / max) * 100, 100);
}
