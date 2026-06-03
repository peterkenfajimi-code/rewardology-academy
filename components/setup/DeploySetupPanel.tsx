import {
  AUTH_CALLBACK_PATH,
  NETLIFY_SITE_URL,
  PRODUCTION_SITE_URL,
  PRODUCTION_AUTH_REDIRECT_URLS,
} from "@/lib/site";

const GITHUB_REPO = "https://github.com/peterkenfajimi-code/rewardology-academy";

function CopyBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="setup-dns-row">
      <span className="setup-dns-label">{label}</span>
      <code className="setup-code inline">{value}</code>
    </div>
  );
}

export function DeploySetupPanel() {
  return (
    <div className="setup-deploy">
      <h2 className="setup-section-title">Deploy — rewardologyacademy.com</h2>
      <p className="setup-section-sub">
        Registrar: <strong>Namecheap</strong>. Hosting: <strong>Netlify</strong> (GitHub repo already
        pushed). DNS values below come from Netlify after you add the custom domain.
      </p>

      <ol className="setup-steps">
        <li>
          <strong>GitHub</strong> — Repo:{" "}
          <a href={GITHUB_REPO} target="_blank" rel="noreferrer">
            peterkenfajimi-code/rewardology-academy
          </a>
        </li>
        <li>
          <strong>Netlify</strong> —{" "}
          <a href="https://app.netlify.com/start" target="_blank" rel="noreferrer">
            Sign up with GitHub
          </a>{" "}
          → <strong>Add new site</strong> → Import <code>rewardology-academy</code>. Netlify detects
          Next.js via <code>netlify.toml</code>.
        </li>
        <li>
          <strong>Environment variables</strong> (Site configuration → Environment variables). Copy
          from <code>.env.local</code>; use production <code>NEXT_PUBLIC_SITE_URL</code> below. Do{" "}
          <strong>not</strong> add <code>SUPABASE_ACCESS_TOKEN</code>.
        </li>
        <li>
          <strong>Live Netlify URL</strong> —{" "}
          <a href={NETLIFY_SITE_URL} target="_blank" rel="noreferrer">
            {NETLIFY_SITE_URL}
          </a>
          . Supabase redirect for this URL is configured via{" "}
          <code>npm run configure:supabase-auth</code>.
        </li>
        <li>
          <strong>Custom domain</strong> —{" "}
          <a
            href="https://app.netlify.com/projects/effulgent-cajeta-57593b/domain-management"
            target="_blank"
            rel="noreferrer"
          >
            Netlify → Domain management
          </a>{" "}
          → Add <code>rewardologyacademy.com</code> and <code>www.rewardologyacademy.com</code> → set
          primary to apex. Then Namecheap <strong>Advanced DNS</strong> (remove parking / old records):
          <div className="setup-dns-table">
            <CopyBlock label="A Record · Host @" value="75.2.60.5" />
            <CopyBlock
              label="CNAME · Host www"
              value="effulgent-cajeta-57593b.netlify.app"
            />
          </div>
          If Netlify shows different values after you add the domain, use Netlify&apos;s values instead.
        </li>
        <li>
          <strong>Supabase auth URLs</strong> — Run <code>npm run configure:supabase-auth</code> or set
          manually:
          <ul>
            <li>
              Site URL: <code>{PRODUCTION_SITE_URL}</code>
            </li>
            {PRODUCTION_AUTH_REDIRECT_URLS.map((url) => (
              <li key={url}>
                Redirect: <code>{url}</code>
              </li>
            ))}
          </ul>
        </li>
        <li>
          <strong>Resend email</strong> —{" "}
          <a href="https://resend.com/domains" target="_blank" rel="noreferrer">
            resend.com/domains
          </a>{" "}
          → SPF/DKIM in Namecheap → Supabase SMTP →{" "}
          <code>noreply@rewardologyacademy.com</code>
        </li>
        <li>
          Test sign-in at <code>{PRODUCTION_SITE_URL}{AUTH_CALLBACK_PATH}</code> after DNS propagates.
        </li>
      </ol>

      <h3 className="setup-subhead">Netlify environment variables (production)</h3>
      <pre className="setup-code">{`NEXT_PUBLIC_SITE_URL=${PRODUCTION_SITE_URL}
NEXT_PUBLIC_SUPABASE_URL=<from Supabase API settings>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
NEXT_PUBLIC_SANITY_PROJECT_ID=<optional>
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-01-01
ELEVENLABS_API_KEY=<optional>
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL`}</pre>
      <p className="setup-section-sub" style={{ marginTop: 8 }}>
        <code>netlify.toml</code> sets <code>NEXT_PUBLIC_SITE_URL={PRODUCTION_SITE_URL}</code>. After
        DNS propagates, trigger a Netlify redeploy. Keep using <code>{NETLIFY_SITE_URL}</code> until
        the custom domain shows Netlify SSL as active.
      </p>
    </div>
  );
}
