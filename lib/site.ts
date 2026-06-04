/** Canonical production origin (no trailing slash). */
export const PRODUCTION_SITE_URL = "https://rewardologyacademy.com";

export const PRODUCTION_WWW_HOST = "www.rewardologyacademy.com";

/** Netlify deploy URL (update if site is renamed). */
export const NETLIFY_SITE_URL = "https://effulgent-cajeta-57593b.netlify.app";

export const AUTH_CALLBACK_PATH = "/auth/callback";

/** Homepage daily quiz section — use for nav CTA scroll targets. */
export const DAILY_QUIZ_SECTION_ID = "daily-quiz";
export const DAILY_QUIZ_HREF = `/#${DAILY_QUIZ_SECTION_ID}`;

export const SUPABASE_PROJECT_REF = "fgkhowgggwbsosqhfnnz";

export const SUPABASE_GOOGLE_CALLBACK_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co/auth/v1/callback`;

export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) return "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function authCallbackUrl(origin: string): string {
  return `${origin.replace(/\/$/, "")}${AUTH_CALLBACK_PATH}`;
}

export const PRODUCTION_AUTH_REDIRECT_URLS = [
  `${PRODUCTION_SITE_URL}${AUTH_CALLBACK_PATH}`,
  `https://${PRODUCTION_WWW_HOST}${AUTH_CALLBACK_PATH}`,
  `${NETLIFY_SITE_URL}${AUTH_CALLBACK_PATH}`,
  `http://localhost:3000${AUTH_CALLBACK_PATH}`,
] as const;
