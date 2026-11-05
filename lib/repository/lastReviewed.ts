import { createRepositoryReadClient } from "@/lib/supabase/repository/admin";

export function formatRepositoryReviewDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Latest verification-log timestamp (falls back to companies.last_reviewed_at). */
export async function loadRepositoryLastReviewed(): Promise<string | null> {
  const supabase = createRepositoryReadClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.rpc("repository_last_reviewed");
    if (error || !data) return null;
    const formatted = formatRepositoryReviewDate(String(data));
    return formatted || null;
  } catch {
    return null;
  }
}
