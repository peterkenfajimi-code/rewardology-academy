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
        Visitors reach you at <code>{CONTACT_EMAIL}</code> from the About page, Privacy, Terms, and
        waitlist links. Auth mail is sent via Resend from <code>noreply@...</code> only.{" "}
        <code>{CONTACT_EMAIL}</code> is hosted in Zoho Mail (MX on <code>{RESEND_AUTH_DOMAIN}</code>
        ).
      </p>

      <ol className="setup-steps">
        <li>
          In{" "}
          <a href="https://mail.zoho.com" target="_blank" rel="noreferrer">
            Zoho Mail
          </a>
          , confirm <code>{CONTACT_EMAIL}</code> receives and can send mail.
        </li>
        <li>
          In Netlify DNS, ensure MX records point to Zoho (not ImprovMX) and SPF includes both
          Resend (<code>include:amazonses.com</code>) and Zoho as required by your provider.
        </li>
        <li>
          Send a test to <code>{CONTACT_EMAIL}</code> from an external address and confirm delivery
          in Zoho.
        </li>
        <li>
          Admin testimonial alerts and <code>/setup</code> access use{" "}
          <code>{CONTACT_FORWARD_GMAIL}</code> via Resend — separate from the public hello@ inbox.
        </li>
      </ol>

      <p className="setup-section-sub" style={{ marginTop: 16, marginBottom: 0 }}>
        Test the public link:{" "}
        <a href={`${PRODUCTION_SITE_URL}/about`}>{PRODUCTION_SITE_URL}/about</a>
      </p>
    </div>
  );
}
