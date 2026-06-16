import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { COURSES, allLessons } from "@/lib/courses/courseData";
import { SignInPrompt } from "@/components/dashboard/SignInPrompt";
import { MemberDashboard } from "@/components/dashboard/MemberDashboard";
import { type BadgeActionFlags } from "@/lib/xp/badges";
import { type XpSources } from "@/lib/xp/xpRates";
import "@/styles/dashboard.css";

export const metadata = {
  title: "Dashboard — Rewardology Academy",
  description: "Your Rewardology Academy learning profile — XP, ranks, badges, and module progress.",
};

type ProgressRow = {
  quiz_id: number;
  best_score: number;
  best_total: number;
  best_xp: number;
};

type CourseRow = {
  course_id: number;
  lesson_id: string;
  xp: number;
};

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
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
        .select("quiz_id, best_score, best_total, best_xp")
        .eq("user_id", user.id),
      supabase.from("course_progress").select("course_id, lesson_id, xp").eq("user_id", user.id),
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase.from("daily_quiz_completions").select("xp_earned").eq("user_id", user.id),
      supabase.from("article_progress").select("article_id, xp").eq("user_id", user.id),
      supabase.from("dictionary_progress").select("term, xp").eq("user_id", user.id),
    ]);

  const rows = (data as ProgressRow[] | null) ?? [];
  const courseRows = (courseData as CourseRow[] | null) ?? [];

  const quizXp = rows.reduce((s, r) => s + r.best_xp, 0);
  const perfectCount = rows.filter((r) => r.best_score === r.best_total).length;

  const courseLessonsDone = new Map<number, Set<string>>();
  let courseXp = 0;
  for (const r of courseRows) {
    if (r.xp > 0) {
      courseXp += r.xp;
      const set = courseLessonsDone.get(r.course_id) ?? new Set<string>();
      set.add(r.lesson_id);
      courseLessonsDone.set(r.course_id, set);
    }
  }

  const coursesCompleted = COURSES.filter((c) => {
    const lessons = allLessons(c);
    const done = courseLessonsDone.get(c.id) ?? new Set<string>();
    return lessons.every((x) => done.has(x.lesson.id));
  }).length;

  type DailyRow = { xp_earned: number };
  const dailyRows = (dailyData as DailyRow[] | null) ?? [];
  const dailyXp = dailyRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0);

  type ArticleRow = { article_id: number; xp: number };
  const articleRows = (articleData as ArticleRow[] | null) ?? [];
  const articleXp = articleRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const articlesRead = articleRows.length;

  type DictionaryRow = { term: string; xp: number };
  const dictionaryRows = (dictionaryData as DictionaryRow[] | null) ?? [];
  const dictionaryXp = dictionaryRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const dictionaryTermsRead = dictionaryRows.length;

  const sources: XpSources = {
    courses: courseXp,
    articles: articleXp,
    quizzes: quizXp,
    dictionary: dictionaryXp,
    comics: 0,
    daily: dailyXp,
  };

  const badgeActions: BadgeActionFlags = {
    course_complete: coursesCompleted >= 1,
    articles_10: articlesRead >= 10,
    quiz_perfect: perfectCount >= 1,
    dict_50: dictionaryTermsRead >= 50,
  };

  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const profileName = (profile as { full_name?: string } | null)?.full_name;
  const displayName =
    profileName || meta.full_name || meta.name || user.email?.split("@")[0] || "Member";

  return (
    <MemberDashboard displayName={displayName} sources={sources} badgeActions={badgeActions} />
  );
}
