/**
 * Cross-check admin stats aggregates against raw Supabase tables (service role).
 * Usage: SUPABASE_SERVICE_ROLE_KEY=... node scripts/audit-admin-stats.mjs
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://fgkhowgggwbsosqhfnnz.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
if (!key) {
  console.error("Set SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const [
  profiles,
  course,
  quiz,
  daily,
  articles,
  dictionary,
  comics,
  testimonials,
  locations,
] = await Promise.all([
  sb.from("profiles").select("id, created_at", { count: "exact" }),
  sb.from("course_progress").select("user_id, xp"),
  sb.from("quiz_centre_progress").select("user_id, quiz_id, best_xp, best_score, best_total, attempts"),
  sb.from("daily_quiz_completions").select("user_id, xp_earned"),
  sb.from("article_progress").select("user_id, xp"),
  sb.from("dictionary_progress").select("user_id, xp"),
  sb.from("comics_progress").select("user_id, xp"),
  sb.from("testimonials").select("id, status"),
  sb.from("user_locations").select("user_id, country_code, country_name"),
]);

const profileCount = profiles.data?.length ?? 0;
const distinctCourseUsers = new Set((course.data ?? []).map((r) => r.user_id)).size;
const distinctQuizUsers = new Set((quiz.data ?? []).map((r) => r.user_id)).size;
const quizRows = quiz.data?.length ?? 0;
const quizAttemptsSum = (quiz.data ?? []).reduce((s, r) => s + (r.attempts ?? 0), 0);
const courseXp = (course.data ?? []).reduce((s, r) => s + (r.xp ?? 0), 0);
const quizXp = (quiz.data ?? []).reduce((s, r) => s + (r.best_xp ?? 0), 0);
const dailyXp = (daily.data ?? []).reduce((s, r) => s + (r.xp_earned ?? 0), 0);

const withGeo = (locations.data ?? []).filter((r) => r.country_code);
const byCode = new Map();
for (const r of withGeo) {
  const c = r.country_code.toUpperCase();
  byCode.set(c, (byCode.get(c) ?? 0) + 1);
}

console.log(JSON.stringify({
  profiles: profileCount,
  usersWithCourseProgress: distinctCourseUsers,
  usersWithQuizProgress: distinctQuizUsers,
  quizProgressRows: quizRows,
  quizAttemptsColumnSum: quizAttemptsSum,
  xp: {
    course: courseXp,
    quiz: quizXp,
    daily: dailyXp,
    total: courseXp + quizXp + dailyXp +
      (articles.data ?? []).reduce((s, r) => s + (r.xp ?? 0), 0) +
      (dictionary.data ?? []).reduce((s, r) => s + (r.xp ?? 0), 0) +
      (comics.data ?? []).reduce((s, r) => s + (r.xp ?? 0), 0),
  },
  testimonials: {
    pending: (testimonials.data ?? []).filter((t) => t.status === "pending").length,
    approved: (testimonials.data ?? []).filter((t) => t.status === "approved").length,
    rejected: (testimonials.data ?? []).filter((t) => t.status === "rejected").length,
  },
  locations: {
    withCountry: withGeo.length,
    unknown: profileCount - new Set(withGeo.map((r) => r.user_id)).size,
    countries: Object.fromEntries(byCode),
  },
}, null, 2));