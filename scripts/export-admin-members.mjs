/**
 * Export per-user identity, geo, XP, and activity (admin member directory).
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/export-admin-members.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fgkhowgggwbsosqhfnnz.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!key) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

async function listAuthEmails() {
  const map = new Map();
  let page = 1;
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.id && u.email) map.set(u.id, u.email);
    }
    if (data.users.length < 200) break;
    page += 1;
  }
  return map;
}

const [
  emails,
  profilesRes,
  locationsRes,
  courseRes,
  quizRes,
  dailyRes,
  articleRes,
  dictRes,
  comicsRes,
] = await Promise.all([
  listAuthEmails(),
  sb.from("profiles").select("id, full_name, created_at"),
  sb.from("user_locations").select(
    "user_id, country_code, country_name, region, city, last_seen_at"
  ),
  sb.from("course_progress").select("user_id, course_id, lesson_id, xp, updated_at"),
  sb.from("quiz_centre_progress").select(
    "user_id, quiz_id, best_xp, attempts, updated_at"
  ),
  sb.from("daily_quiz_completions").select("user_id, xp_earned, created_at"),
  sb.from("article_progress").select("user_id, xp"),
  sb.from("dictionary_progress").select("user_id, xp"),
  sb.from("comics_progress").select("user_id, xp"),
]);

const locByUser = new Map((locationsRes.data ?? []).map((r) => [r.user_id, r]));
const course = courseRes.data ?? [];
const quiz = quizRes.data ?? [];
const daily = dailyRes.data ?? [];

const maxIso = (dates) => {
  const v = dates.filter(Boolean);
  if (!v.length) return null;
  return v.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
};

const rows = (profilesRes.data ?? []).map((p) => {
  const uid = p.id;
  const courseRows = course.filter((r) => r.user_id === uid);
  const quizRows = quiz.filter((r) => r.user_id === uid);
  const dailyRows = daily.filter((r) => r.user_id === uid);
  const loc = locByUser.get(uid);
  const xpCourses = courseRows.reduce((s, r) => s + (r.xp ?? 0), 0);
  const xpQuiz = quizRows.reduce((s, r) => s + (r.best_xp ?? 0), 0);
  const xpDaily = dailyRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0);
  return {
    email: emails.get(uid) ?? null,
    fullName: p.full_name,
    registeredAt: p.created_at,
    location: loc
      ? {
          place: [loc.city, loc.region, loc.country_name || loc.country_code]
            .filter(Boolean)
            .join(", "),
          lastGeoAt: loc.last_seen_at,
        }
      : null,
    xpTotal: xpCourses + xpQuiz + xpDaily,
    activity: {
      coursesTouched: new Set(courseRows.map((r) => r.course_id)).size,
      lessonRows: courseRows.length,
      quizAttempts: quizRows.reduce((s, r) => s + (r.attempts ?? 1), 0),
      dailyQuizzes: dailyRows.length,
      lastLearningAt: maxIso([
        ...courseRows.map((r) => r.updated_at),
        ...quizRows.map((r) => r.updated_at),
        ...dailyRows.map((r) => r.created_at),
      ]),
    },
  };
});

rows.sort((a, b) => {
  const ta = a.location?.lastGeoAt ?? a.activity.lastLearningAt ?? a.registeredAt ?? "";
  const tb = b.location?.lastGeoAt ?? b.activity.lastLearningAt ?? b.registeredAt ?? "";
  return tb.localeCompare(ta);
});

console.log(JSON.stringify(rows, null, 2));