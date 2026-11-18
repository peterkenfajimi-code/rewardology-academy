import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceAdminClient } from "@/lib/supabase/serviceAdmin";

export type AdminStatsSnapshot = {
  profiles: { id: string; created_at: string | null }[];
  courseProgress: {
    user_id: string;
    course_id: number;
    lesson_id: string;
    xp: number | null;
    updated_at: string | null;
  }[];
  quizProgress: {
    user_id: string;
    quiz_id: number;
    best_xp: number | null;
    best_score: number | null;
    best_total: number | null;
    updated_at: string | null;
  }[];
  dailyQuiz: { user_id: string; xp_earned: number | null; created_at: string | null }[];
  articleProgress: { user_id: string; xp: number | null }[];
  dictionaryProgress: { user_id: string; xp: number | null }[];
  comicsProgress: { user_id: string; xp: number | null }[];
  testimonials: { id: string; status: string }[];
};

export type LocationStats = {
  totalTracked: number;
  totalUsers: number;
  unknown: number;
  countriesRepresented: number;
  byCountry: { countryCode: string; countryName: string | null; users: number }[];
  byRegion: { countryCode: string; region: string; users: number }[];
  recent: {
    countryCode: string;
    countryName: string | null;
    region: string | null;
    city: string | null;
    lastSeenAt: string;
  }[];
};

type UserLocationRow = {
  user_id: string;
  country_code: string | null;
  country_name: string | null;
  region: string | null;
  city: string | null;
  last_seen_at: string;
};

/** Load platform-wide stats: RPC first, then service-role table reads (Netlify env). */
export async function loadAdminStatsSnapshot(
  supabase: SupabaseClient
): Promise<{ data: AdminStatsSnapshot | null; error: string | null }> {
  const rpc = await supabase.rpc("admin_stats_snapshot");
  if (!rpc.error && rpc.data) {
    return { data: rpc.data as AdminStatsSnapshot, error: null };
  }

  const svc = getServiceAdminClient();
  if (!svc) {
    return {
      data: null,
      error:
        rpc.error?.message ??
        "admin_stats_snapshot missing. Apply supabase/admin-platform-stats.sql or set SUPABASE_SERVICE_ROLE_KEY on the server.",
    };
  }

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
    svc.from("profiles").select("id, created_at"),
    svc.from("course_progress").select("user_id, course_id, lesson_id, xp, updated_at"),
    svc.from("quiz_centre_progress").select("user_id, quiz_id, best_xp, best_score, best_total, updated_at"),
    svc.from("daily_quiz_completions").select("user_id, xp_earned, created_at"),
    svc.from("article_progress").select("user_id, xp"),
    svc.from("dictionary_progress").select("user_id, xp"),
    svc.from("comics_progress").select("user_id, xp"),
    svc.from("testimonials").select("id, status"),
  ]);

  const firstError =
    profilesRes.error ||
    courseProgressRes.error ||
    quizProgressRes.error ||
    dailyRes.error ||
    articleProgressRes.error ||
    dictionaryProgressRes.error ||
    comicsProgressRes.error ||
    testimonialsRes.error;

  if (firstError) {
    return { data: null, error: firstError.message };
  }

  return {
    data: {
      profiles: profilesRes.data ?? [],
      courseProgress: courseProgressRes.data ?? [],
      quizProgress: quizProgressRes.data ?? [],
      dailyQuiz: dailyRes.data ?? [],
      articleProgress: articleProgressRes.data ?? [],
      dictionaryProgress: dictionaryProgressRes.data ?? [],
      comicsProgress: comicsProgressRes.data ?? [],
      testimonials: testimonialsRes.data ?? [],
    },
    error: null,
  };
}

export function buildLocationStatsFromRows(
  profileIds: string[],
  rows: UserLocationRow[]
): LocationStats {
  const rowByUser = new Map(rows.map((r) => [r.user_id, r]));
  let unknown = 0;
  for (const id of profileIds) {
    const ul = rowByUser.get(id);
    if (!ul?.country_code) unknown += 1;
  }
  const profileCount = profileIds.length;
  const tracked = rows.filter((r) => r.country_code);

  const byCountryMap = new Map<string, { countryName: string | null; users: number }>();
  for (const row of tracked) {
    const code = row.country_code!.toUpperCase();
    const prev = byCountryMap.get(code) ?? { countryName: row.country_name, users: 0 };
    prev.users += 1;
    if (!prev.countryName && row.country_name) prev.countryName = row.country_name;
    byCountryMap.set(code, prev);
  }
  const byCountry = [...byCountryMap.entries()]
    .map(([countryCode, v]) => ({
      countryCode,
      countryName: v.countryName,
      users: v.users,
    }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 20);

  const byRegionMap = new Map<string, { countryCode: string; users: number }>();
  for (const row of tracked) {
    if (!row.region?.trim()) continue;
    const key = `${row.country_code}::${row.region}`;
    const prev = byRegionMap.get(key) ?? {
      countryCode: row.country_code!.toUpperCase(),
      users: 0,
    };
    prev.users += 1;
    byRegionMap.set(key, prev);
  }
  const byRegion = [...byRegionMap.entries()]
    .map(([key, v]) => ({
      countryCode: v.countryCode,
      region: key.split("::").slice(1).join("::"),
      users: v.users,
    }))
    .sort((a, b) => b.users - a.users)
    .slice(0, 15);

  const recent = [...tracked]
    .sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime())
    .slice(0, 10)
    .map((r) => ({
      countryCode: r.country_code!.toUpperCase(),
      countryName: r.country_name,
      region: r.region,
      city: r.city,
      lastSeenAt: r.last_seen_at,
    }));

  return {
    totalTracked: profileCount - unknown,
    totalUsers: profileCount,
    unknown,
    countriesRepresented: byCountryMap.size,
    byCountry,
    byRegion,
    recent,
  };
}

export async function loadAdminLocationStats(
  supabase: SupabaseClient,
  profileIds: string[]
): Promise<LocationStats> {
  const profileCount = profileIds.length;
  const rpc = await supabase.rpc("admin_user_location_stats");
  if (!rpc.error && rpc.data) {
    const loc = rpc.data as LocationStats;
    if (loc.totalUsers !== profileCount) {
      return { ...loc, totalUsers: profileCount };
    }
    return loc;
  }

  const svc = getServiceAdminClient();
  if (!svc) {
    return {
      totalTracked: 0,
      totalUsers: profileCount,
      unknown: profileCount,
      countriesRepresented: 0,
      byCountry: [],
      byRegion: [],
      recent: [],
    };
  }

  const { data, error } = await svc
    .from("user_locations")
    .select("user_id, country_code, country_name, region, city, last_seen_at");
  if (error || !data) {
    return {
      totalTracked: 0,
      totalUsers: profileCount,
      unknown: profileCount,
      countriesRepresented: 0,
      byCountry: [],
      byRegion: [],
      recent: [],
    };
  }

  return buildLocationStatsFromRows(profileIds, data as UserLocationRow[]);
}