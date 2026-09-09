import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { COMIC_ISSUES, COMIC_SERIES } from "@/lib/comics/comicData";
import { COURSES } from "@/lib/courses/courseData";
import {
  DICTIONARY_CATEGORIES,
  DICTIONARY_TERM_COUNT,
} from "@/lib/dictionary/terms";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import {
  MAX_PLATFORM_XP,
  PLATFORM_LESSON_COUNT,
  PLATFORM_QUIZ_QUESTIONS,
} from "@/lib/xp/platformMax";

const AVAILABLE_COMIC_COUNT = COMIC_ISSUES.filter((i) => i.available).length;

export function PlatformStatsStrip() {
  const stats = [
    { num: COURSES.length, suffix: "", label: "Expert Courses", sub: "Beginner to Advanced" },
    { num: PLATFORM_LESSON_COUNT, suffix: "", label: "Structured Lessons", sub: "Across all courses" },
    { num: ESSENTIALS_ARTICLES.length, suffix: "", label: "Practitioner Articles", sub: "Published 2026" },
    {
      num: PLATFORM_QUIZ_QUESTIONS,
      suffix: "",
      label: "Quiz Questions",
      sub: `Across ${QUIZ_CENTRE.length} topics`,
    },
    {
      num: DICTIONARY_TERM_COUNT,
      suffix: "",
      label: "Dictionary Terms",
      sub: `Across ${DICTIONARY_CATEGORIES.length} disciplines`,
    },
    {
      num: AVAILABLE_COMIC_COUNT,
      suffix: "",
      label: "Comic Issues",
      sub: COMIC_SERIES.title,
    },
    {
      num: MAX_PLATFORM_XP.toLocaleString(),
      suffix: "",
      label: "XP Available",
      sub: "Courses + Articles + Quizzes + Dictionary + Comics",
      raw: true,
    },
  ];

  return (
    <section className="platform-stats-strip">
      <div className="platform-stats-row">
        {stats.map((s) => (
          <div key={s.label} className="platform-stat-block">
            <div className="platform-stat-num">
              {s.raw ? s.num : s.num}
              {s.suffix ? <span>{s.suffix}</span> : null}
            </div>
            <div className="platform-stat-label">{s.label}</div>
            <div className="platform-stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
