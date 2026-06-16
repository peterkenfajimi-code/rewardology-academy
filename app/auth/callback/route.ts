import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/env";
import { safeNextPath } from "@/lib/auth/routes";
import { parseSignupConsentCookie, SIGNUP_CONSENT_COOKIE } from "@/lib/auth/signupConsent";

// Exchanges the OAuth / email-confirmation code for a session cookie, then
// redirects back into the app.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");
  const next = safeNextPath(searchParams.get("next"));

  if (oauthError) {
    const message = oauthDescription || oauthError;
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(message)}&next=${encodeURIComponent(next)}`
    );
  }

  if (code && isSupabaseConfigured()) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/login?error=${encodeURIComponent(error.message)}&next=${encodeURIComponent(next)}`
      );
    }

    const consentRaw = cookieStore.get(SIGNUP_CONSENT_COOKIE)?.value;
    const consent = parseSignupConsentCookie(consentRaw);
    if (consent) {
      await supabase.auth.updateUser({
        data: {
          marketing_consent: consent.marketing_consent,
          terms_accepted_at: consent.terms_accepted_at,
        },
      });
      cookieStore.delete(SIGNUP_CONSENT_COOKIE);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
