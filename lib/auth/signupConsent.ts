export const SIGNUP_CONSENT_COOKIE = "ra_signup_consent";

export type SignupConsentPayload = {
  marketing_consent: boolean;
  terms_accepted_at: string;
};

export function signupConsentPayload(marketingConsent: boolean): SignupConsentPayload {
  return {
    marketing_consent: marketingConsent,
    terms_accepted_at: new Date().toISOString(),
  };
}

/** Persist signup consent before OAuth redirect (read on /auth/callback). */
export function writeSignupConsentCookie(payload: SignupConsentPayload) {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(payload));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${SIGNUP_CONSENT_COOKIE}=${value}; Path=/; Max-Age=600; SameSite=Lax${secure}`;
}

export function clearSignupConsentCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SIGNUP_CONSENT_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function parseSignupConsentCookie(raw: string | undefined): SignupConsentPayload | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as SignupConsentPayload;
    if (typeof parsed.marketing_consent !== "boolean" || !parsed.terms_accepted_at) return null;
    return parsed;
  } catch {
    return null;
  }
}
