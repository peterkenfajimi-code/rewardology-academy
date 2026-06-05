"use client";

import { useCallback, useEffect, useState } from "react";
import { isGoogleOAuthEnabled } from "@/lib/env";
import { SUPABASE_GOOGLE_CALLBACK_URL } from "@/lib/site";
import type { SupabaseHealth } from "@/lib/supabase/health";

function CheckRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="setup-check-row">
      <span>{label}</span>
      <span className={`setup-check-pill${ok ? " ok" : ""}`}>{ok ? "Ready" : "Missing"}</span>
    </div>
  );
}

export function SupabaseSetupPanel({ configured }: { configured: boolean }) {
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup/supabase");
      setHealth((await res.json()) as SupabaseHealth);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configured) refresh();
  }, [configured, refresh]);

  return (
    <div className="setup-supabase">
      <h2 className="setup-section-title">Supabase setup</h2>
      <p className="setup-section-sub">
        Powers sign-in, soft-gated courses/quizzes/comics, XP sync, and your dashboard.
      </p>

      {!configured ? (
        <ol className="setup-steps">
          <li>
            Create a project at{" "}
            <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer">
              supabase.com/dashboard
            </a>
          </li>
          <li>
            Open <strong>Project Settings → API</strong> and copy the Project URL and{" "}
            <code>anon</code> public key into <code>.env.local</code>:
            <pre className="setup-code">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}</pre>
          </li>
          <li>
            Open <strong>SQL Editor</strong>, paste the contents of{" "}
            <code>supabase/schema.sql</code>, and run it.
            <br />
            <span style={{ opacity: 0.75 }}>
              Or add <code>SUPABASE_ACCESS_TOKEN</code> to <code>.env.local</code> and run{" "}
              <code>node scripts/apply-supabase-schema.mjs</code>.
            </span>
          </li>
          <li>
            Under <strong>Authentication → URL Configuration</strong> (or run{" "}
            <code>npm run configure:supabase-auth</code> after adding{" "}
            <code>SUPABASE_ACCESS_TOKEN</code>):
            <ul>
              <li>
                Production site URL: <code>https://rewardologyacademy.com</code>
              </li>
              <li>
                Redirect URLs: production + <code>http://localhost:3000/auth/callback</code> (see
                Deploy section above)
              </li>
            </ul>
          </li>
          <li>Restart the dev server, then return here and click Check schema.</li>
        </ol>
      ) : (
        <>
          <div className="setup-actions">
            <button type="button" className="setup-btn" onClick={refresh} disabled={loading}>
              {loading ? "Checking…" : "Check schema"}
            </button>
          </div>

          {health && (
            <div className="setup-checks">
              <CheckRow label="API keys in .env.local" ok={health.configured} />
              <CheckRow label="profiles table" ok={health.tables.profiles} />
              <CheckRow label="quiz_centre_progress table" ok={health.tables.quiz_centre_progress} />
              <CheckRow label="course_progress table" ok={health.tables.course_progress} />
              <CheckRow
                label="daily_quiz_completions table"
                ok={health.tables.daily_quiz_completions}
              />
              <CheckRow
                label="record_quiz_centre_attempt()"
                ok={health.rpc.record_quiz_centre_attempt}
              />
              <CheckRow label="record_course_lesson()" ok={health.rpc.record_course_lesson} />
              <CheckRow
                label="record_daily_quiz_completion()"
                ok={health.rpc.record_daily_quiz_completion}
              />
              {health.error && <p className="setup-warn">{health.error}</p>}
              {health.reachable && (
                <p className="setup-ok">
                  Supabase is ready. Try{" "}
                  <a href="/signup">creating an account</a> or{" "}
                  <a href="/login">signing in</a>.
                </p>
              )}
            </div>
          )}

          <div className="setup-google" style={{ marginTop: 28 }}>
            <h3 className="setup-subhead">Google sign-in</h3>
            <p className="setup-section-sub">
              Status:{" "}
              {isGoogleOAuthEnabled() ? (
                <strong style={{ color: "#34d399" }}>Enabled in app</strong>
              ) : (
                <strong style={{ color: "#e2ac50" }}>Not enabled yet</strong>
              )}
            </p>
            <ol className="setup-steps">
              <li>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Cloud → Credentials
                </a>{" "}
                → OAuth client ID → <strong>Web application</strong>
              </li>
              <li>
                Authorized redirect URI (exact): <code>{SUPABASE_GOOGLE_CALLBACK_URL}</code>
              </li>
              <li>
                Add to <code>.env.local</code>:
                <pre className="setup-code">{`GOOGLE_CLIENT_ID=....apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=....
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`}</pre>
              </li>
              <li>
                Run <code>npm run configure:google-oauth</code> (uses{" "}
                <code>SUPABASE_ACCESS_TOKEN</code>)
              </li>
              <li>
                Add <code>NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true</code> to Netlify env (or{" "}
                <code>netlify.toml</code>) and redeploy
              </li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
