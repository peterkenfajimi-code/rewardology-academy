import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CONTACT_FORWARD_GMAIL } from "@/lib/site";
import { COURSES, allLessons } from "@/lib/courses/courseData";

const DENY = NextResponse.json({ error: "Forbidden" }, { status: 403 });

export async function GET() {
  if (!isSupabaseConfigured()) return DENY;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.email?.toLowerCase() !== CONTACT_FORWARD_GMAIL.toLowerCase()) return DENY;

  // Run all stat queries in parallel
  const [
    profilesRes,
    courseProgressRes,
    quizProgressRes,
    dailyRes,
    articleProgressRes,
    dictionaryProgressRes,
    comicsProgressRes,
    testimonialsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("id, created_at"),
    supabase.from("course_progress").select("user_id, course_id, lesson_id, xp, updated_at"),
    supabase.from("quiz_centre_progress").select("user_id, quiz_id, best_xp, best_score, best_total"),
    supabase.from("daily_quiz_completions").select("user_id, xp_earned, completed_at"),
    supabase.from("article_progress").select("user_id, xp"),
    supabase.from("dictionary_progress").select("user_id, xp"),
    supabase.from("comics_progress").select("user_id, xp"),
    supabase.from("testimonials").select("id, status, source_type, source_label, rating, created_at"),
  ]);

  const profiles = profilesRes.data ?? [];
  const courseRows = courseProgressRes.data ?? [];
  const quizRows = quizProgressRes.data ?? [];
  const dailyRows = dailyRes.data ?? [];
  const articleRows = articleProgressRes.data ?? [];
  const dictionaryRows = dictionaryProgressRes.data ?? [];
  const comicsRows = comicsProgressRes.data ?? [];
  const testimonials = testimonialsRes.data ?? [];

  // ── User metrics ──
  const totalUsers = profiles.length;
  const now = Date.now();
  const DAY = 86_400_000;
  const newUsersLast7 = profiles.filter(
    (p) => p.created_at && now - new Date(p.created_at).getTime() < 7 * DAY
  ).length;
  const newUsersLast30 = profiles.filter(
    (p) => p.created_at && now - new Date(p.created_at).getTime() < 30 * DAY
  ).length;

  // ── XP metrics ──
  const courseXpTotal = courseRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const quizXpTotal = quizRows.reduce((s, r) => s + (r.best_xp ?? 0), 0);
  const dailyXpTotal = dailyRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0);
  const articleXpTotal = articleRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const dictionaryXpTotal = dictionaryRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const comicsXpTotal = comicsRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const totalXpAllUsers =
    courseXpTotal + quizXpTotal + dailyXpTotal + articleXpTotal + dictionaryXpTotal + comicsXpTotal;

  // ── Active users (any activity in last 7 / 30 days) ──
  const recentActivity = [...courseRows, ...quizRows, ...dailyRows].filter(
    (r) => (r as { updated_at?: string; completed_at?: string }).updated_at ||
            (r as { completed_at?: string }).completed_at
  );
  const activeUserIds7 = new Set(
    recentActivity
      .filter((r) => {
        const ts = (r as { updated_at?: string; completed_at?: string }).updated_at ||
                   (r as { completed_at?: string }).completed_at;
        return ts && now - new Date(ts).getTime() < 7 * DAY;
      })
      .map((r) => r.user_id)
  );
  const activeUserIds30 = new Set(
    recentActivity
      .filter((r) => {
        const ts = (r as { updated_at?: string; completed_at?: string }).updated_at ||
                   (r as { completed_at?: string }).completed_at;
        return ts && now - new Date(ts).getTime() < 30 * DAY;
      })
      .map((r) => r.user_id)
  );

  // ── Course completion per course ──
  const courseStats = COURSES.map((course) => {
    const lessons = allLessons(course);
    const lessonIds = new Set(lessons.map((x) => x.lesson.id));
    const userMap = new Map<string, Set<string>>();
    for (const r of courseRows) {
      if (r.course_id !== course.id || (r.xp ?? 0) === 0) continue;
      const set = userMap.get(r.user_id) ?? new Set();
      set.add(r.lesson_id);
      userMap.set(r.user_id, set);
    }
    const started = userMap.size;
    const completed = [...userMap.values()].filter(
      (done) => lessonIds.size > 0 && [...lessonIds].every((id) => done.has(id))
    ).length;
    const totalLessonsXp = [...userMap.values()].reduce((s, done) => s + done.size, 0);
    const avgPct =
      started > 0
        ? Math.round((totalLessonsXp / (started * lessonIds.size)) * 100)
        : 0;
    return { id: course.id, title: course.title, started, completed, avgPct };
  });

  // ── Quiz metrics ──
  const quizUsersCount = new Set(quizRows.map((r) => r.user_id)).size;
  const quizPerfectCount = quizRows.filter((r) => r.best_score === r.best_total).length;
  const quizAttempts = quizRows.length;

  // ── Testimonials ──
  const testimonialsByStatus = {
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
  };

  return NextResponse.json({
    users: { total: totalUsers, newLast7: newUsersLast7, newLast30: newUsersLast30, active7: activeUserIds7.size, active30: activeUserIds30.size },
    xp: { total: totalXpAllUsers, courses: courseXpTotal, quizzes: quizXpTotal, daily: dailyXpTotal, articles: articleXpTotal, dictionary: dictionaryXpTotal, comics: comicsXpTotal },
    courses: courseStats,
    quizzes: { usersAttempted: quizUsersCount, attempts: quizAttempts, perfectScores: quizPerfectCount },
    testimonials: testimonialsByStatus,
  });
}
