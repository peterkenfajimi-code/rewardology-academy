import { RESEND_AUTH_DOMAIN, RESEND_SMTP_HOST, SUPABASE_PROJECT_REF } from "@/lib/site";

export type ResendHealth = {
  /** RESEND_API_KEY present in server env */
  apiKeyConfigured: boolean;
  domain: string;
  domainStatus: "verified" | "pending" | "failed" | "not_found" | "unknown";
  supabaseSmtpConfigured: boolean | null;
  supabaseFromEmail: string | null;
  reachable: boolean;
  error?: string;
};

const RESEND_API = "https://api.resend.com";

type ResendDomain = {
  name?: string;
  status?: string;
};

type ResendDomainsResponse = {
  data?: ResendDomain[];
};

type SupabaseAuthConfig = {
  smtp_host?: string;
  smtp_admin_email?: string;
  external_email_enabled?: boolean;
};

async function fetchResendDomainStatus(apiKey: string, domain: string): Promise<ResendHealth["domainStatus"]> {
  const res = await fetch(`${RESEND_API}/domains`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return "unknown";

  const body = (await res.json()) as ResendDomainsResponse;
  const match = body.data?.find((d) => d.name === domain || d.name === `www.${domain}`);
  if (!match) return "not_found";

  const status = (match.status ?? "").toLowerCase();
  if (status === "verified") return "verified";
  if (status === "failed" || status === "temporary_failure") return "failed";
  if (status === "not_started" || status === "pending") return "pending";
  return "unknown";
}

async function fetchSupabaseSmtpStatus(): Promise<{
  configured: boolean | null;
  fromEmail: string | null;
}> {
  const token = process.env.SUPABASE_ACCESS_TOKEN?.trim();
  const projectRef = SUPABASE_PROJECT_REF;
  if (!token) return { configured: null, fromEmail: null };

  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return { configured: null, fromEmail: null };

  const config = (await res.json()) as SupabaseAuthConfig;
  const configured =
    Boolean(config.external_email_enabled) &&
    config.smtp_host === RESEND_SMTP_HOST &&
    Boolean(config.smtp_admin_email);

  return { configured, fromEmail: config.smtp_admin_email ?? null };
}

export async function checkResendHealth(): Promise<ResendHealth> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const domain = RESEND_AUTH_DOMAIN;

  const base: ResendHealth = {
    apiKeyConfigured: Boolean(apiKey),
    domain,
    domainStatus: "unknown",
    supabaseSmtpConfigured: null,
    supabaseFromEmail: null,
    reachable: false,
  };

  if (!apiKey) {
    return {
      ...base,
      error:
        "Add RESEND_API_KEY to .env.local (local only — not needed on Netlify). Supabase stores the key for sending.",
    };
  }

  try {
    const [domainStatus, smtp] = await Promise.all([
      fetchResendDomainStatus(apiKey, domain),
      fetchSupabaseSmtpStatus(),
    ]);

    const reachable = domainStatus === "verified" && smtp.configured === true;

    return {
      ...base,
      domainStatus,
      supabaseSmtpConfigured: smtp.configured,
      supabaseFromEmail: smtp.fromEmail,
      reachable,
      error:
        domainStatus === "not_found"
          ? `Add ${domain} in Resend → Domains and configure DNS in Netlify.`
          : domainStatus === "pending"
          ? "Domain DNS is propagating — wait for Verified in Resend."
          : domainStatus !== "verified"
          ? "Domain not verified in Resend yet."
          : smtp.configured === false
          ? "Run npm run configure:resend-smtp to push SMTP settings into Supabase."
          : smtp.configured === null
          ? "Add SUPABASE_ACCESS_TOKEN to .env.local to verify Supabase SMTP from this page."
          : undefined,
    };
  } catch (e) {
    return {
      ...base,
      error: e instanceof Error ? e.message : "Could not reach Resend API",
    };
  }
}
