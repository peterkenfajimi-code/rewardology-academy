import {
  CONTACT_EMAIL,
  CONTACT_FORWARD_GMAIL,
  PRODUCTION_SITE_URL,
  RESEND_AUTH_DOMAIN,
} from "@/lib/site";

export function ImprovMXSetupPanel() {
  return (
    <div className="setup-resend">
      <h2 className="setup-section-title">Contact email (hello@)</h2>
      <p className="setup-section-sub">
        Visitors reach you at <code>{CONTACT_EMAIL}</code> from the About page. Resend sends auth
        mail only (<code>noreply@...</code>). To <strong>receive</strong> contact messages, forward{" "}
        <code>{CONTACT_EMAIL}</code> to your Gmail with ImprovMX + Netlify DNS.
      </p>

      <ol className="setup-steps">
        <li>
          Sign up at{" "}
          <a href="https://improvmx.com" target="_blank" rel="noreferrer">
            improvmx.com
          </a>{" "}
          → add domain <code>{RESEND_AUTH_DOMAIN}</code>
        </li>
        <li>
          <strong>Aliases</strong> → create alias <code>hello</code> → forward to{" "}
          <code>{CONTACT_FORWARD_GMAIL}</code>
        </li>
        <li>
          In{" "}
          <a
            href="https://app.netlify.com/projects/effulgent-cajeta-57593b/domain-management"
            target="_blank"
            rel="noreferrer"
          >
            Netlify → Domain management → DNS
          </a>
          , add MX records (Name <code>@</code>):
          <div className="setup-dns-table">
            <div className="setup-dns-row">
              <span className="setup-dns-label">MX priority 10</span>
              <code className="setup-code inline">mx1.improvmx.com</code>
            </div>
            <div className="setup-dns-row">
              <span className="setup-dns-label">MX priority 20</span>
              <code className="setup-code inline">mx2.improvmx.com</code>
            </div>
          </div>
        </li>
        <li>
          Add SPF TXT on <code>@</code>. If Resend is already verified, combine into one record:{" "}
          <pre className="setup-code">{`v=spf1 include:amazonses.com include:spf.improvmx.com ~all`}</pre>
          Otherwise use ImprovMX&apos;s recommended SPF only. See{" "}
          <a href="https://improvmx.com/guides/netlify/" target="_blank" rel="noreferrer">
            ImprovMX Netlify guide
          </a>
          .
        </li>
        <li>
          Wait for ImprovMX to show <strong>Email forwarding active</strong>, then send a test to{" "}
          <code>{CONTACT_EMAIL}</code> and confirm it arrives at Gmail.
        </li>
        <li>
          Optional — reply from <code>{CONTACT_EMAIL}</code> in Gmail: Settings → Accounts → Send mail
          as.{" "}
          <a href="https://improvmx.com/guides/gmails-send-mail-as/" target="_blank" rel="noreferrer">
            ImprovMX guide
          </a>
        </li>
      </ol>

      <p className="setup-section-sub" style={{ marginTop: 16, marginBottom: 0 }}>
        Test the public link:{" "}
        <a href={`${PRODUCTION_SITE_URL}/about`}>{PRODUCTION_SITE_URL}/about</a>
      </p>
    </div>
  );
}
