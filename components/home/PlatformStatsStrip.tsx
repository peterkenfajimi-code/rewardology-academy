import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { COURSES } from "@/lib/courses/courseData";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import {
  MAX_PLATFORM_XP,
  PLATFORM_LESSON_COUNT,
  PLATFORM_QUIZ_QUESTIONS,
} from "@/lib/xp/platformMax";

export function PlatformStatsStrip() {
  const stats = [
    { num: COURSES.length, suffix: "", label: "Expert Courses", sub: "Beginner to Advanced" },
    { num: PLATFORM_LESSON_COUNT, suffix: "", label: "Structured Lessons", sub: "Across all courses" },
    { num: ESSENTIALS_ARTICLES.length, suffix: "", label: "Practitioner Articles", sub: "Published 2026" },
    { num: PLATFORM_QUIZ_QUESTIONS, suffix: "", label: "Quiz Questions", sub: "Across 10 topics" },
    {
      num: MAX_PLATFORM_XP.toLocaleString(),
      suffix: "",
      label: "XP Available",
      sub: "Courses + Articles + Quizzes",
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
