/** Canonical production origin (no trailing slash). */
export const PRODUCTION_SITE_URL = "https://rewardologyacademy.com";

export const PRODUCTION_WWW_HOST = "www.rewardologyacademy.com";

export const AUTH_CALLBACK_PATH = "/auth/callback";

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
  `http://localhost:3000${AUTH_CALLBACK_PATH}`,
] as const;
