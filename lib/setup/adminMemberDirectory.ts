import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceAdminClient } from "@/lib/supabase/serviceAdmin";
import type { AdminStatsSnapshot } from "@/lib/setup/adminPlatformData";

export type AdminMemberRow = {
  userId: string;
  email: string | null;
  fullName: string | null;
  registeredAt: string | null;
  location: {
    countryCode: string | null;
    countryName: string | null;
    region: string | null;
    city: string | null;
    lastGeoAt: string | null;
  } | null;
  xp: {
    total: number;
    courses: number;
    quizzes: number;
    daily: number;
    articles: number;
    dictionary: number;
    comics: number;
  };
  activity: {
    courseLessonRows: number;
    coursesTouched: number;
    quizQuizzesAttempted: number;
    quizAttempts: number;
    dailyQuizCompletions: number;
    articlesRead: number;
    dictionaryTerms: number;
    comicsIssues: number;
    lastLearningAt: string | null;
  };
};

async function listAuthEmails(svc: SupabaseClient): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  let page = 1;
  const perPage = 200;
  for (;;) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage });
    if (error || !data?.users?.length) break;
    for (const u of data.users) {
      if (u.id && u.email) map.set(u.id, u.email);
    }
    if (data.users.length < perPage) break;
    page += 1;
  }
  return map;
}

function maxIso(dates: (string | null | undefined)[]): string | null {
  const valid = dates.filter(Boolean) as string[];
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
}

/** Platform owner view: identity + geo + learning activity per registered user. */
export async function buildAdminMemberDirectory(
  snap: AdminStatsSnapshot
): Promise<AdminMemberRow[] | null> {
  const svc = getServiceAdminClient();
  if (!svc) return null;

  const [emails, locationsRes] = await Promise.all([
    listAuthEmails(svc),
    svc
      .from("user_locations")
      .select("user_id, country_code, country_name, region, city, last_seen_at"),
  ]);

  const locByUser = new Map(
    (locationsRes.data ?? []).map((r) => [
      r.user_id,
      {
        countryCode: r.country_code,
        countryName: r.country_name,
        region: r.region,
        city: r.city,
        lastGeoAt: r.last_seen_at,
      },
    ])
  );

  const rows: AdminMemberRow[] = [];

  for (const profile of snap.profiles) {
    const uid = profile.id;
    const courseRows = snap.courseProgress.filter((r) => r.user_id === uid);
    const quizRows = snap.quizProgress.filter((r) => r.user_id === uid);
    const dailyRows = snap.dailyQuiz.filter((r) => r.user_id === uid);
    const articleRows = snap.articleProgress.filter((r) => r.user_id === uid);
    const dictRows = snap.dictionaryProgress.filter((r) => r.user_id === uid);
    const comicsRows = snap.comicsProgress.filter((r) => r.user_id === uid);

    const xpCourses = courseRows.reduce((s, r) => s + (r.xp ?? 0), 0);
    const xpQuiz = quizRows.reduce((s, r) => s + (r.best_xp ?? 0), 0);
    const xpDaily = dailyRows.reduce((s, r) => s + (r.xp_earned ?? 0), 0);
    const xpArticles = articleRows.reduce((s, r) => s + (r.xp ?? 0), 0);
    const xpDict = dictRows.reduce((s, r) => s + (r.xp ?? 0), 0);
    const xpComics = comicsRows.reduce((s, r) => s + (r.xp ?? 0), 0);

    const lastLearningAt = maxIso([
      ...courseRows.map((r) => r.updated_at),
      ...quizRows.map((r) => r.updated_at),
      ...dailyRows.map((r) => r.created_at),
    ]);

    rows.push({
      userId: uid,
      email: emails.get(uid) ?? null,
      fullName: profile.full_name,
      registeredAt: profile.created_at,
      location: locByUser.get(uid) ?? null,
      xp: {
        total: xpCourses + xpQuiz + xpDaily + xpArticles + xpDict + xpComics,
        courses: xpCourses,
        quizzes: xpQuiz,
        daily: xpDaily,
        articles: xpArticles,
        dictionary: xpDict,
        comics: xpComics,
      },
      activity: {
        courseLessonRows: courseRows.length,
        coursesTouched: new Set(courseRows.map((r) => r.course_id)).size,
        quizQuizzesAttempted: quizRows.length,
        quizAttempts: quizRows.reduce((s, r) => s + (r.attempts ?? 1), 0),
        dailyQuizCompletions: dailyRows.length,
        articlesRead: articleRows.length,
        dictionaryTerms: dictRows.length,
        comicsIssues: comicsRows.length,
        lastLearningAt,
      },
    });
  }

  rows.sort((a, b) => {
    const ta = a.location?.lastGeoAt ?? a.activity.lastLearningAt ?? a.registeredAt ?? "";
    const tb = b.location?.lastGeoAt ?? b.activity.lastLearningAt ?? b.registeredAt ?? "";
    return tb.localeCompare(ta);
  });

  return rows;
}
