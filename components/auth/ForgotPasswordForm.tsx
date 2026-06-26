"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/env";
import "@/styles/auth.css";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) return;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/reset-password`
        : "/auth/callback?next=/reset-password";

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="ra-auth ra-auth-page">
      <div className="ra-auth-page-inner">
        <Link href="/login" className="ra-auth-back">← Back to sign in</Link>

        <div className="ra-modal ra-auth-card">
          <div className="ra-modal-brand">
            <span className="ra-modal-mark">R</span>
            <span className="ra-modal-brand-text">Rewardology Academy</span>
          </div>

          <h2 className="ra-modal-title">
            Reset your <em>password</em>
          </h2>
          <p className="ra-modal-sub">
            {sent
              ? "Check your inbox — we've sent you a link to reset your password. It may take a minute to arrive."
              : "Enter the email address linked to your account and we'll send you a reset link."}
          </p>

          {!sent && (
            <>
              {error && <div className="ra-error">{error}</div>}
              {!configured && (
                <div className="ra-warn">
                  Account features aren&apos;t configured yet. Password reset requires Supabase to be set up.
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="ra-field">
                  <label className="ra-label" htmlFor="fp-email">Email</label>
                  <input
                    id="fp-email"
                    className="ra-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    autoFocus
                    disabled={!configured || loading}
                  />
                </div>
                <button
                  className="ra-submit"
                  type="submit"
                  disabled={!configured || loading}
                >
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          {sent && (
            <div className="ra-notice">
              ✓ Reset link sent to <strong>{email}</strong>
            </div>
          )}

          <div className="ra-switch">
            Remembered it?{" "}
            <Link href="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
