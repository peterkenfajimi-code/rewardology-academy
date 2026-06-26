"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import "@/styles/auth.css";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 2500);
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
            Choose a new <em>password</em>
          </h2>
          <p className="ra-modal-sub">
            {done
              ? "Password updated! Redirecting you to your dashboard…"
              : "Enter and confirm your new password below."}
          </p>

          {!done && (
            <>
              {error && <div className="ra-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="ra-field">
                  <label className="ra-label" htmlFor="rp-password">New password</label>
                  <input
                    id="rp-password"
                    className="ra-input"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    autoFocus
                    disabled={loading}
                  />
                </div>
                <div className="ra-field">
                  <label className="ra-label" htmlFor="rp-confirm">Confirm password</label>
                  <input
                    id="rp-confirm"
                    className="ra-input"
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                </div>
                <button className="ra-submit" type="submit" disabled={loading}>
                  {loading ? "Updating…" : "Set new password"}
                </button>
              </form>
            </>
          )}

          {done && (
            <div className="ra-notice">
              ✓ Password updated successfully.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
