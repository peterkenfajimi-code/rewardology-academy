"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AuthMode } from "@/components/auth/AuthProvider";
import { SignupConsentFields } from "@/components/auth/SignupConsentFields";
import { signupConsentPayload, writeSignupConsentCookie } from "@/lib/auth/signupConsent";
import { isGoogleOAuthEnabled } from "@/lib/env";

type Props = {
  mode: AuthMode;
  setMode?: (m: AuthMode) => void;
  switchHref?: string;
  supabase: SupabaseClient | null;
  configured: boolean;
  nextPath?: string;
  onSuccess?: () => void;
};

export function AuthForm({
  mode,
  setMode,
  switchHref,
  supabase,
  configured,
  nextPath = "/dashboard",
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const isSignup = mode === "signup";
  const googleEnabled = isGoogleOAuthEnabled();
  const signupBlocked = isSignup && !agreedTerms;

  useEffect(() => {
    setError(null);
    setNotice(null);
    if (mode !== "signup") {
      setAgreedTerms(false);
      setMarketingConsent(false);
    }
  }, [mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get("error");
    if (oauthError) setError(oauthError);
  }, []);

  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (isSignup && !agreedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to create an account.");
      return;
    }
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (isSignup) {
        const consent = signupConsentPayload(marketingConsent);
        const { data, error: signErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name || undefined,
              marketing_consent: consent.marketing_consent,
              terms_accepted_at: consent.terms_accepted_at,
            },
            emailRedirectTo: callbackUrl,
          },
        });
        if (signErr) throw signErr;
        if (data.session) {
          onSuccess?.();
        } else {
          setNotice("Check your inbox to confirm your email, then sign in.");
        }
      } else {
        const { error: signErr } = await supabase.auth.signInWithPassword({ email, password });
        if (signErr) throw signErr;
        onSuccess?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!supabase) return;
    if (isSignup && !agreedTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy to continue.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignup) {
        writeSignupConsentCookie(signupConsentPayload(marketingConsent));
      }
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl },
      });
      if (oauthErr) throw oauthErr;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start Google sign-in.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ra-modal-brand">
        <span className="ra-modal-mark">R</span>
        <span className="ra-modal-brand-text">Rewardology Academy</span>
      </div>

      <h2 className="ra-modal-title">
        {isSignup ? (
          <>
            Join the <em>Academy</em>
          </>
        ) : (
          <>
            Welcome <em>back</em>
          </>
        )}
      </h2>
      <p className="ra-modal-sub">
        {isSignup
          ? "Create a free account to access courses, quizzes, comics, and sync your progress."
          : "Sign in to access courses, quizzes, comics, and your dashboard."}
      </p>

      {!configured && (
        <div className="ra-warn">
          Accounts aren&apos;t configured yet. Add your Supabase keys to enable sign-in — progress
          will save on this device in the meantime.
        </div>
      )}

      {error && <div className="ra-error">{error}</div>}
      {notice && <div className="ra-notice">{notice}</div>}

      <form onSubmit={handleSubmit}>
        {isSignup && (
          <div className="ra-field">
            <label className="ra-label" htmlFor="ra-name">
              Name
            </label>
            <input
              id="ra-name"
              className="ra-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              disabled={!configured || loading}
            />
          </div>
        )}
        <div className="ra-field">
          <label className="ra-label" htmlFor="ra-email">
            Email
          </label>
          <input
            id="ra-email"
            className="ra-input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            autoComplete="email"
            disabled={!configured || loading}
          />
        </div>
        <div className="ra-field">
          <label className="ra-label" htmlFor="ra-password">
            Password
          </label>
          <input
            id="ra-password"
            className="ra-input"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={isSignup ? "At least 6 characters" : "Your password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            disabled={!configured || loading}
          />
        </div>
        {isSignup && (
          <SignupConsentFields
            agreedTerms={agreedTerms}
            onAgreedTermsChange={setAgreedTerms}
            marketingConsent={marketingConsent}
            onMarketingConsentChange={setMarketingConsent}
            disabled={!configured || loading}
          />
        )}
        <button
          className="ra-submit"
          type="submit"
          disabled={!configured || loading || signupBlocked}
        >
          {loading ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
        </button>
      </form>

      {googleEnabled && (
        <>
          <div className="ra-divider">or</div>

          <button className="ra-oauth" onClick={handleGoogle} disabled={!configured || loading || signupBlocked}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.4 36.3 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"
              />
            </svg>
            Continue with Google
          </button>
        </>
      )}

      <div className="ra-switch">
        {isSignup ? (
          <>
            Already have an account?{" "}
            {switchHref ? (
              <Link href={switchHref}>Sign in</Link>
            ) : (
              <button type="button" onClick={() => setMode?.("login")}>
                Sign in
              </button>
            )}
          </>
        ) : (
          <>
            New to Rewardology?{" "}
            {switchHref ? (
              <Link href={switchHref}>Create an account</Link>
            ) : (
              <button type="button" onClick={() => setMode?.("signup")}>
                Create an account
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}
