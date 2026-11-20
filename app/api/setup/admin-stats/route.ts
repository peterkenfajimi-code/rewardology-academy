import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/admin";
import { COURSES, allLessons } from "@/lib/courses/courseData";
import { loadAdminLocationStats, loadAdminStatsSnapshot } from "@/lib/setup/adminPlatformData";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const loaded = await loadAdminStatsSnapshot(admin.supabase);
  if (!loaded.data) {
    return NextResponse.json(
      {
        error: "Admin dashboard is not configured for platform-wide stats yet.",
        detail: loaded.error,
        remediation: {
          fastest: [
            "Netlify → Site configuration → Environment variables",
            "Add SUPABASE_SERVICE_ROLE_KEY = Supabase project Settings → API → service_role secret (not anon)",
            "Deploy site → Trigger deploy → refresh this page",
          ],
          alternate: [
            "Or run: node scripts/apply-admin-platform-stats.mjs (requires SUPABASE_ACCESS_TOKEN in .env.local)",
          ],
          projectRef: "fgkhowgggwbsosqhfnnz",
        },
      },
      { status: 503 }
    );
  }

  const {
    profiles,
    courseProgress: courseRows,
    quizProgress: quizRows,
    dailyQuiz: dailyRows,
    articleProgress: articleRows,
    dictionaryProgress: dictionaryRows,
    comicsProgress: comicsRows,
    testimonials,
  } = loaded.data;

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
  type ActivityRow = { user_id: string; updated_at?: string; created_at?: string };
  const activityTs = (r: ActivityRow) => r.updated_at ?? r.created_at;
  const recentActivity = [...courseRows, ...quizRows, ...dailyRows].filter((r) => activityTs(r as ActivityRow));
  const activeUserIds7 = new Set(
    recentActivity
      .filter((r) => {
        const ts = activityTs(r as ActivityRow);
        return ts && now - new Date(ts).getTime() < 7 * DAY;
      })
      .map((r) => r.user_id)
  );
  const activeUserIds30 = new Set(
    recentActivity
      .filter((r) => {
        const ts = activityTs(r as ActivityRow);
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
      started > 0 ? Math.round((totalLessonsXp / (started * lessonIds.size)) * 100) : 0;
    return { id: course.id, title: course.title, started, completed, avgPct };
  });

  // ── Quiz metrics ──
  const quizUsersCount = new Set(quizRows.map((r) => r.user_id)).size;
  const quizPerfectCount = quizRows.filter((r) => r.best_score === r.best_total).length;
  const quizAttempts = quizRows.reduce((s, r) => s + (r.attempts ?? 1), 0);

  // ── Testimonials ──
  const testimonialsByStatus = {
    pending: testimonials.filter((t) => t.status === "pending").length,
    approved: testimonials.filter((t) => t.status === "approved").length,
    rejected: testimonials.filter((t) => t.status === "rejected").length,
  };

  const locations = await loadAdminLocationStats(
    admin.supabase,
    profiles.map((p) => p.id)
  );

  return NextResponse.json({
    users: {
      total: totalUsers,
      newLast7: newUsersLast7,
      newLast30: newUsersLast30,
      active7: activeUserIds7.size,
      active30: activeUserIds30.size,
    },
    xp: {
      total: totalXpAllUsers,
      courses: courseXpTotal,
      quizzes: quizXpTotal,
      daily: dailyXpTotal,
      articles: articleXpTotal,
      dictionary: dictionaryXpTotal,
      comics: comicsXpTotal,
    },
    courses: courseStats,
    quizzes: { usersAttempted: quizUsersCount, attempts: quizAttempts, perfectScores: quizPerfectCount },
    testimonials: testimonialsByStatus,
    locations,
  });
}