export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isSanityConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}

export function isElevenLabsConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY);
}

/** Set NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true after running configure:google-oauth */
export function isGoogleOAuthEnabled() {
  return process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === "true";
}

/** True when RESEND_API_KEY is set (local .env only — used for setup scripts). */
export function isResendApiKeyConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

/** Africa Benefits Repository — separate Supabase project (never Academy prod). */
export function isRepositorySupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_REPOSITORY_SUPABASE_URL &&
      process.env.REPOSITORY_SUPABASE_SERVICE_KEY
  );
}

export function isRepositoryAdminConfigured() {
  const token = process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim() || "";
  const password = process.env.REPOSITORY_ADMIN_PASSWORD?.trim() || "";
  return Boolean(
    process.env.REPOSITORY_ADMIN_USERNAME?.trim() &&
      password &&
      token.length >= 32 &&
      token !== password
  );
}

export function isAnthropicConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
}

/** logo.dev publishable key — read server-side only, so the admin preview proxies through our API. */
export function logoDevKey(): string | null {
  return process.env.PUBLIC_LOGO_DEV_KEY?.trim() || null;
}
