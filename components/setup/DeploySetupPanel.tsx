import {
  AUTH_CALLBACK_PATH,
  PRODUCTION_SITE_URL,
  PRODUCTION_AUTH_REDIRECT_URLS,
} from "@/lib/site";

const VERCEL_APEX_IP = "76.76.21.21";
const VERCEL_WWW_CNAME = "cname.vercel-dns.com";

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
        Registrar: <strong>Namecheap</strong>. Hosting: <strong>Vercel</strong> (recommended for this
        Next.js app). Complete the steps in order.
      </p>

      <ol className="setup-steps">
        <li>
          <strong>GitHub</strong> — Install{" "}
          <a href="https://git-scm.com/download/win" target="_blank" rel="noreferrer">
            Git for Windows
          </a>
          , create a repo, push this project (do not commit <code>.env.local</code>).
        </li>
        <li>
          <strong>Vercel</strong> —{" "}
          <a href="https://vercel.com/new" target="_blank" rel="noreferrer">
            Import the GitHub repo
          </a>
          . Framework: Next.js. Add environment variables from <code>.env.example</code> (production{" "}
          <code>NEXT_PUBLIC_SITE_URL</code> below).
        </li>
        <li>
          <strong>Vercel domains</strong> — Project → Settings → Domains → add{" "}
          <code>rewardologyacademy.com</code> and <code>www.rewardologyacademy.com</code>. Set primary
          to <code>rewardologyacademy.com</code> (www redirects via <code>vercel.json</code>).
        </li>
        <li>
          <strong>Namecheap DNS</strong> — Domain List → Manage → <strong>Advanced DNS</strong>:
          <div className="setup-dns-table">
            <CopyBlock label="A Record · Host @" value={VERCEL_APEX_IP} />
            <CopyBlock label="CNAME · Host www" value={VERCEL_WWW_CNAME} />
          </div>
          Remove parking / conflicting URL redirect records for <code>@</code> and <code>www</code>.
        </li>
        <li>
          <strong>Supabase auth URLs</strong> — Run locally:{" "}
          <code>npm run configure:supabase-auth</code> (needs <code>SUPABASE_ACCESS_TOKEN</code> in{" "}
          <code>.env.local</code>), or set manually under Authentication → URL Configuration:
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
          <strong>Resend email</strong> — Add domain at{" "}
          <a href="https://resend.com/domains" target="_blank" rel="noreferrer">
            resend.com/domains
          </a>
          , paste SPF/DKIM into Namecheap Advanced DNS, then Supabase → Authentication → SMTP with
          sender <code>noreply@rewardologyacademy.com</code>.
        </li>
        <li>
          Test <code>{PRODUCTION_SITE_URL}{AUTH_CALLBACK_PATH}</code> after deploy — sign up on
          production and confirm email delivery.
        </li>
      </ol>

      <h3 className="setup-subhead">Vercel environment variables (production)</h3>
      <pre className="setup-code">{`NEXT_PUBLIC_SITE_URL=${PRODUCTION_SITE_URL}
NEXT_PUBLIC_SUPABASE_URL=<from Supabase API settings>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
NEXT_PUBLIC_SANITY_PROJECT_ID=<optional>
NEXT_PUBLIC_SANITY_DATASET=production
ELEVENLABS_API_KEY=<optional>
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL`}</pre>
      <p className="setup-section-sub" style={{ marginTop: 8 }}>
        Do <strong>not</strong> add <code>SUPABASE_ACCESS_TOKEN</code> to Vercel — local scripts only.
      </p>
    </div>
  );
}
