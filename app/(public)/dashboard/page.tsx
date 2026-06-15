import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { QUIZ_CENTRE } from "@/lib/quizzes/quizCentre";
import { COURSES, allLessons } from "@/lib/courses/courseData";
import { computeStreak } from "@/lib/daily-quiz/streak";
import { todayDateKey } from "@/lib/daily-quiz/dailyQuizData";
import { courseResumeHref, lessonKey, type LessonXpMap } from "@/lib/courses/progress";
import { SignInPrompt } from "@/components/dashboard/SignInPrompt";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { maxArticleXp } from "@/lib/articles/progress";
import { DICTIONARY_TERM_COUNT, DICTIONARY_XP_PER_TERM } from "@/lib/dictionary/terms";
import { levelFor } from "@/lib/xp/levels";
import { sumPlatformXp } from "@/lib/xp/sumPlatformXp";
import "@/styles/dashboard.css";

export const metadata = {
  title: "Dashboard — Rewardology Academy",
};

type ProgressRow = {
  quiz_id: number;
  best_score: number;
  best_total: number;
  best_xp: number;
  attempts: number;
  updated_at: string;
};

type CourseRow = {
  course_id: number;
  lesson_id: string;
  xp: number;
};

function hexToRgba(hex: string, a: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function DashboardPage() {
  const configured = isSupabaseConfigured();
  if (!configured) {
    return <SignInPrompt configured={false} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <SignInPrompt configured />;
  }

  const [{ data }, { data: courseData }, { data: profile }, { data: dailyData }, { data: articleData }, { data: dictionaryData }] =
    await Promise.all([
      supabase
        .from("quiz_centre_progress")
        .select("quiz_id, best_score, best_total, best_xp, attempts, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("course_progress")
        .select("course_id, lesson_id, xp")
        .eq("user_id", user.id),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("daily_quiz_completions")
        .select("quiz_date, correct, xp_earned")
        .eq("user_id", user.id)
        .order("quiz_date", { ascending: false }),
      supabase
        .from("article_progress")
        .select("article_id, slug, xp, read_at")
        .eq("user_id", user.id)
        .order("read_at", { ascending: false }),
      supabase
        .from("dictionary_progress")
        .select("term, xp, read_at")
        .eq("user_id", user.id)
        .order("read_at", { ascending: false }),
    ]);

  const rows = (data as ProgressRow[] | null) ?? [];
  const courseRows = (courseData as CourseRow[] | null) ?? [];

  const quizXp = rows.reduce((s, r) => s + r.best_xp, 0);
  const completedCount = rows.length;
  const perfectCount = rows.filter((r) => r.best_score === r.best_total).length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          (rows.reduce((s, r) => s + r.best_score / r.best_total, 0) / completedCount) * 100
        )
      : 0;

  // ── Course progress ──
  const courseLxp: LessonXpMap = {};
  const courseXpById = new Map<number, number>();
  const courseLessonsDone = new Map<number, Set<string>>();
  for (const r of courseRows) {
    if (r.xp > 0) {
      courseLxp[lessonKey(r.course_id, r.lesson_id)] = r.xp;
      courseXpById.set(r.course_id, (courseXpById.get(r.course_id) ?? 0) + r.xp);
      const set = courseLessonsDone.get(r.course_id) ?? new Set<string>();
      set.add(r.lesson_id);
      courseLessonsDone.set(r.course_id, set);
    }
  }
  const courseStats = COURSES.map((c) => {
    const earned = courseXpById.get(c.id) ?? 0;
    const lessons = allLessons(c);
    const doneSet = courseLessonsDone.get(c.id) ?? new Set<string>();
    const done = lessons.filter((x) => doneSet.has(x.lesson.id)).length;
    return {
      course: c,
      earned,
      pct: Math.min(100, Math.round((earned / c.total_xp) * 100)),
      done,
      total: lessons.length,
      complete: done >= lessons.length,
    };
  });
  const courseXpTotal = courseStats.reduce((s, cs) => s + cs.earned, 0);
  const coursesCompleted = courseStats.filter((cs) => cs.complete).length;

  type DailyRow = { quiz_date: string; correct: boolean; xp_earned: number };
  const dailyRows = (dailyData as DailyRow[] | null) ?? [];
  const dailyXp = dailyRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0);
  const dailyStreak = computeStreak(
    dailyRows.map((r) => String(r.quiz_date).slice(0, 10)),
    todayDateKey()
  );
  const dailyCompletions = dailyRows.length;

  type ArticleRow = { article_id: number; slug: string; xp: number; read_at: string };
  const articleRows = (articleData as ArticleRow[] | null) ?? [];
  const articleXp = articleRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const articlesRead = articleRows.length;
  const articlesMaxXp = maxArticleXp();

  type DictionaryRow = { term: string; xp: number; read_at: string };
  const dictionaryRows = (dictionaryData as DictionaryRow[] | null) ?? [];
  const dictionaryXp = dictionaryRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const dictionaryTermsRead = dictionaryRows.length;
  const dictionaryMaxXp = DICTIONARY_TERM_COUNT * DICTIONARY_XP_PER_TERM;

  const totalXp = sumPlatformXp({
    quizXp,
    courseXp: courseXpTotal,
    dailyXp,
    articleXp,
    dictionaryXp,
  });
  const { current, next } = levelFor(totalXp);
  const levelProgress = next
    ? Math.min(100, Math.round(((totalXp - current.min) / (next.min - current.min)) * 100))
    : 100;

  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const profileName = (profile as { full_name?: string } | null)?.full_name;
  const displayName =
    profileName || meta.full_name || meta.name || user.email?.split("@")[0] || "Member";

  const badges = [
    { icon: "🎯", name: "First Steps", desc: "Complete your first quiz", earned: completedCount >= 1 },
    { icon: "💎", name: "Flawless", desc: "Score 100% on any quiz", earned: perfectCount >= 1 },
    { icon: "🔥", name: "Halfway There", desc: "Complete 5 quizzes", earned: completedCount >= 5 },
    { icon: "👑", name: "Total Mastery", desc: "Complete all 10 quizzes", earned: completedCount >= 10 },
    { icon: "📖", name: "Article Reader", desc: "Read 5 Total Rewards articles", earned: articlesRead >= 5 },
    { icon: "📚", name: "Term Explorer", desc: "Look up 10 dictionary terms", earned: dictionaryTermsRead >= 10 },
    { icon: "⚡", name: "XP Hunter", desc: "Earn 750 XP", earned: totalXp >= 750 },
    { icon: "🏆", name: "Grand Master", desc: "Reach 1,350 XP", earned: totalXp >= 1350 },
  ];

  return (
    <div className="dash">
      <div className="dash-head">
        <div>
          <div className="dash-eyebrow">Member Dashboard</div>
          <h1 className="dash-title">
            Welcome back, <em>{displayName}</em>
          </h1>
        </div>
        <div className="dash-rank-chip">★ {current.name}</div>
      </div>

      <div className="dash-stats">
        <div className="dash-stat">
          <div className="dash-stat-num">
            {totalXp.toLocaleString()}
            <span> XP</span>
          </div>
          <div className="dash-stat-label">Total experience</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {completedCount}
            <span> /10</span>
          </div>
          <div className="dash-stat-label">Quizzes completed</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {avgScore}
            <span>%</span>
          </div>
          <div className="dash-stat-label">Average best score</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {dailyStreak}
            <span> 🔥</span>
          </div>
          <div className="dash-stat-label">Daily quiz streak</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {dailyCompletions}
            <span> ✓</span>
          </div>
          <div className="dash-stat-label">Daily quizzes done</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {articlesRead}
            <span> /25</span>
          </div>
          <div className="dash-stat-label">Articles read</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {articleXp}
            <span> XP</span>
          </div>
          <div className="dash-stat-label">Article XP ({articlesMaxXp} max)</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {dictionaryTermsRead}
            <span> /{DICTIONARY_TERM_COUNT}</span>
          </div>
          <div className="dash-stat-label">Dictionary terms</div>
        </div>
        <div className="dash-stat">
          <div className="dash-stat-num">
            {dictionaryXp}
            <span> XP</span>
          </div>
          <div className="dash-stat-label">Dictionary XP ({dictionaryMaxXp} max)</div>
        </div>
      </div>

      <div className="dash-level">
        <div className="dash-level-top">
          <div className="dash-level-name">{current.name}</div>
          <div className="dash-level-next">
            {next
              ? `${(next.min - totalXp).toLocaleString()} XP to ${next.name}`
              : "Top rank achieved"}
          </div>
        </div>
        <div className="dash-level-bar">
          <div className="dash-level-fill" style={{ width: `${levelProgress}%` }} />
        </div>
      </div>

      <h2 className="dash-section-title">Achievements</h2>
      <div className="dash-badges">
        {badges.map((b) => (
          <div key={b.name} className={`dash-badge ${b.earned ? "earned" : "locked"}`}>
            <div className="dash-badge-icon">{b.icon}</div>
            <div className="dash-badge-name">{b.name}</div>
            <div className="dash-badge-desc">{b.desc}</div>
          </div>
        ))}
      </div>

      <h2 className="dash-section-title">
        Courses{coursesCompleted > 0 ? ` · ${coursesCompleted} completed` : ""}
      </h2>
      <div className="dash-history">
        {courseStats.map((cs) => (
          <div key={cs.course.id} className="dash-row">
            <div
              className="dash-row-icon"
              style={{ background: hexToRgba(cs.course.color, 0.16), color: cs.course.color }}
            >
              {cs.course.icon}
            </div>
            <div className="dash-row-main">
              <div className="dash-row-title">{cs.course.title}</div>
              <div className="dash-row-sub">
                <span>
                  {cs.done}/{cs.total} lessons
                </span>
                <span style={{ opacity: 0.4 }}>·</span>
                <span>
                  {cs.complete ? "Completed" : cs.pct === 0 ? "Not started" : `${cs.pct}% complete`}
                </span>
              </div>
            </div>
            <div className="dash-row-score" style={{ color: cs.course.color }}>
              {cs.earned}/{cs.course.total_xp}
            </div>
            <div className="dash-row-xp">⚡ {cs.earned} XP</div>
            <Link href={courseResumeHref(cs.course.id, courseLxp)} className="dash-row-cta">
              {cs.complete ? "Review" : cs.pct === 0 ? "Start →" : "Continue →"}
            </Link>
          </div>
        ))}
      </div>

      <h2 className="dash-section-title">
        Articles{articlesRead > 0 ? ` · ${articlesRead} read` : ""}
      </h2>
      {articleRows.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No articles completed yet</div>
          <p className="dash-empty-sub">
            Read to at least 78% of an article to earn XP. Progress syncs here when you are
            signed in.
          </p>
          <Link href="/articles/all" className="ra-auth ra-auth-btn ra-auth-btn-primary">
            Browse articles →
          </Link>
        </div>
      ) : (
        <div className="dash-history">
          {articleRows.map((row) => {
            const article = ESSENTIALS_ARTICLES.find((a) => a.id === row.article_id);
            const color = article?.color ?? "#c8963e";
            return (
              <div key={row.article_id} className="dash-row">
                <div
                  className="dash-row-icon"
                  style={{ background: hexToRgba(color, 0.16), color }}
                >
                  📖
                </div>
                <div className="dash-row-main">
                  <div className="dash-row-title">{article?.title ?? `Article ${row.article_id}`}</div>
                  <div className="dash-row-sub">
                    <span>{article?.category ?? "Total Rewards"}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{formatDate(row.read_at)}</span>
                  </div>
                </div>
                <div className="dash-row-xp">⚡ {row.xp} XP</div>
                <Link href={`/articles/${row.slug}`} className="dash-row-cta">
                  Re-read →
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <h2 className="dash-section-title">
        Dictionary{dictionaryTermsRead > 0 ? ` · ${dictionaryTermsRead} terms` : ""}
      </h2>
      {dictionaryRows.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No dictionary terms explored yet</div>
          <p className="dash-empty-sub">
            Expand any term in the Total Rewards Dictionary to earn 5 XP. Progress syncs here
            when you are signed in.
          </p>
          <Link href="/dictionary" className="ra-auth ra-auth-btn ra-auth-btn-primary">
            Open dictionary →
          </Link>
        </div>
      ) : (
        <div className="dash-history">
          {dictionaryRows.slice(0, 8).map((row) => (
            <div key={row.term} className="dash-row">
              <div
                className="dash-row-icon"
                style={{ background: "rgba(12,107,101,0.16)", color: "#0E8A83" }}
              >
                📚
              </div>
              <div className="dash-row-main">
                <div className="dash-row-title">{row.term}</div>
                <div className="dash-row-sub">
                  <span>Dictionary</span>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{formatDate(row.read_at)}</span>
                </div>
              </div>
              <div className="dash-row-xp">⚡ {row.xp} XP</div>
              <Link href="/dictionary" className="dash-row-cta">
                View →
              </Link>
            </div>
          ))}
        </div>
      )}

      <h2 className="dash-section-title">Quiz history</h2>
      {rows.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-title">No quizzes completed yet</div>
          <p className="dash-empty-sub">
            Head to the Quiz Centre, pick a topic, and start earning XP. Your best results will
            appear here and sync across every device.
          </p>
          <Link href="/quizzes" className="ra-auth ra-auth-btn ra-auth-btn-primary">
            Go to Quiz Centre →
          </Link>
        </div>
      ) : (
        <div className="dash-history">
          {rows.map((row) => {
            const quiz = QUIZ_CENTRE.find((q) => q.id === row.quiz_id);
            const color = quiz?.color ?? "#c8963e";
            const pct = Math.round((row.best_score / row.best_total) * 100);
            return (
              <div key={row.quiz_id} className="dash-row">
                <div
                  className="dash-row-icon"
                  style={{ background: hexToRgba(color, 0.16), color }}
                >
                  {quiz?.icon ?? "◈"}
                </div>
                <div className="dash-row-main">
                  <div className="dash-row-title">{quiz?.title ?? `Quiz ${row.quiz_id}`}</div>
                  <div className="dash-row-sub">
                    <span>{quiz?.category ?? "Total Rewards"}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>
                      {row.attempts} attempt{row.attempts === 1 ? "" : "s"}
                    </span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{formatDate(row.updated_at)}</span>
                  </div>
                </div>
                <div className="dash-row-score" style={{ color }}>
                  {row.best_score}/{row.best_total}
                </div>
                <div className="dash-row-xp">⚡ {row.best_xp} XP</div>
                <Link href="/quizzes" className="dash-row-cta">
                  {pct === 100 ? "Replay" : "Improve →"}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
