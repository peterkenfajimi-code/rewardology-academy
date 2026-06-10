"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PRODUCTION_SITE_URL,
  RESEND_FROM_EMAIL,
  RESEND_SENDER_NAME,
  RESEND_SMTP_HOST,
  RESEND_SMTP_PORT,
  RESEND_SMTP_USER,
  SUPABASE_PROJECT_REF,
} from "@/lib/site";
import type { ResendHealth } from "@/lib/resend/health";

function CheckRow({ label, ok, pending }: { label: string; ok: boolean; pending?: boolean }) {
  const text = pending ? "Pending" : ok ? "Ready" : "Missing";
  const cls = pending ? "" : ok ? " ok" : "";
  return (
    <div className="setup-check-row">
      <span>{label}</span>
      <span className={`setup-check-pill${cls}`} style={pending ? { color: "#e2ac50", background: "rgba(200,150,62,.15)" } : undefined}>
        {text}
      </span>
    </div>
  );
}

function domainOk(status: ResendHealth["domainStatus"]) {
  return status === "verified";
}

function domainPending(status: ResendHealth["domainStatus"]) {
  return status === "pending" || status === "unknown";
}

export function ResendSetupPanel() {
  const [health, setHealth] = useState<ResendHealth | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/setup/resend");
      setHealth((await res.json()) as ResendHealth);
    } catch {
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="setup-resend">
      <h2 className="setup-section-title">Resend email (Supabase SMTP)</h2>
      <p className="setup-section-sub">
        Supabase sends signup confirmation, password reset, and magic-link emails. Resend delivers
        them from <code>{RESEND_FROM_EMAIL}</code> so messages land in Gmail/Outlook instead of spam.
      </p>

      <div className="setup-actions">
        <button type="button" className="setup-btn" onClick={refresh} disabled={loading}>
          {loading ? "Checking…" : "Check Resend status"}
        </button>
      </div>

      {health && (
        <div className="setup-checks">
          <CheckRow label="RESEND_API_KEY in .env.local" ok={health.apiKeyConfigured} />
          <CheckRow
            label={`Domain ${health.domain} verified`}
            ok={domainOk(health.domainStatus)}
            pending={domainPending(health.domainStatus)}
          />
          <CheckRow
            label="Supabase custom SMTP (Resend)"
            ok={health.supabaseSmtpConfigured === true}
            pending={health.supabaseSmtpConfigured === null}
          />
          {health.supabaseFromEmail && (
            <p className="setup-section-sub" style={{ marginTop: 8, marginBottom: 0 }}>
              Supabase sender: <code>{health.supabaseFromEmail}</code>
            </p>
          )}
          {health.error && <p className="setup-warn">{health.error}</p>}
          {health.reachable && (
            <p className="setup-ok">
              Resend is ready. Test at <a href={`${PRODUCTION_SITE_URL}/signup`}>Sign up</a> with a
              real inbox, then check{" "}
              <a href="https://resend.com/emails" target="_blank" rel="noreferrer">
                Resend → Emails
              </a>
              .
            </p>
          )}
        </div>
      )}

      <ol className="setup-steps" style={{ marginTop: 24 }}>
        <li>
          Create a free account at{" "}
          <a href="https://resend.com/signup" target="_blank" rel="noreferrer">
            resend.com
          </a>
        </li>
        <li>
          <strong>Domains</strong> →{" "}
          <a href="https://resend.com/domains" target="_blank" rel="noreferrer">
            Add domain
          </a>{" "}
          → enter <code>rewardologyacademy.com</code>
        </li>
        <li>
          Add Resend DNS records (SPF + DKIM) in{" "}
          <a
            href="https://app.netlify.com/projects/effulgent-cajeta-57593b/domain-management"
            target="_blank"
            rel="noreferrer"
          >
            Netlify → Domain management → DNS
          </a>
          . Wait until Resend shows <strong>Verified</strong>.
        </li>
        <li>
          <strong>API Keys</strong> → Create API key → add to <code>.env.local</code>:
          <pre className="setup-code">{`RESEND_API_KEY=re_...
# optional:
# RESEND_FROM_EMAIL=${RESEND_FROM_EMAIL}
# RESEND_SENDER_NAME=${RESEND_SENDER_NAME}`}</pre>
        </li>
        <li>
          Run (requires <code>SUPABASE_ACCESS_TOKEN</code> in <code>.env.local</code>):
          <pre className="setup-code">npm run configure:resend-smtp</pre>
        </li>
        <li>
          Or set manually in{" "}
          <a
            href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}/auth/smtp`}
            target="_blank"
            rel="noreferrer"
          >
            Supabase → Authentication → SMTP
          </a>
          :
          <div className="setup-dns-table">
            <div className="setup-dns-row">
              <span className="setup-dns-label">Sender email</span>
              <code className="setup-code inline">{RESEND_FROM_EMAIL}</code>
            </div>
            <div className="setup-dns-row">
              <span className="setup-dns-label">Sender name</span>
              <code className="setup-code inline">{RESEND_SENDER_NAME}</code>
            </div>
            <div className="setup-dns-row">
              <span className="setup-dns-label">Host / Port</span>
              <code className="setup-code inline">
                {RESEND_SMTP_HOST}:{RESEND_SMTP_PORT}
              </code>
            </div>
            <div className="setup-dns-row">
              <span className="setup-dns-label">Username / Password</span>
              <code className="setup-code inline">{RESEND_SMTP_USER} / your API key</code>
            </div>
          </div>
        </li>
      </ol>

      <p className="setup-section-sub" style={{ marginTop: 16, marginBottom: 0 }}>
        Resend free tier is enough for launch. The API key lives in Supabase SMTP for sending.
        Add <code>SUPABASE_ACCESS_TOKEN</code> and <code>RESEND_API_KEY</code> as server-only Netlify
        env vars to enable live checks on this page.
      </p>
    </div>
  );
}
