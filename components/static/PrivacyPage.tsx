import Link from "next/link";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { CONTACT_EMAIL } from "@/lib/site";
import "@/styles/static-pages.css";

const LEGAL_DATE = "1 June 2026";

export function PrivacyPage() {
  return (
    <div className="sp-root">
      <StaticPageHero
        eyebrow="Legal"
        title={
          <>
            Privacy <em>Policy</em>
          </>
        }
        subtitle="How Rewardology Academy collects, uses, and protects your personal data."
        updated={`Effective date: ${LEGAL_DATE} · Last updated: ${LEGAL_DATE}`}
      />

      <div className="sp-content">
        <div className="sp-legal-intro">
          This Privacy Policy explains how Rewardology Academy (&quot;<strong>we</strong>&quot;, &quot;
          <strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;) handles personal data when
          you use our website at{" "}
          <Link href="/">rewardologyacademy.com</Link>. We are committed to protecting your privacy
          and handling your data transparently and responsibly. Please read this policy carefully.
          By using the platform, you accept the practices described here.
        </div>

        <div className="sp-legal-body">
          <h2>1. Who We Are</h2>
          <p>
            Rewardology Academy is an online learning platform for Total Rewards, Compensation and
            Benefits professionals. The platform is operated from Nigeria and serves a global learner
            base. For any privacy-related enquiries, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>

          <h2>2. What Data We Collect</h2>
          <p>
            We collect data in two ways: data you provide directly, and data collected automatically
            when you use the platform.
          </p>
          <h3>Data you provide</h3>
          <ul>
            <li>
              <strong>Account information</strong> — if you create a free account, we collect your
              email address and any profile details you choose to provide (such as your name).
            </li>
            <li>
              <strong>Contact information</strong> — if you email us or join the waitlist for a
              course, we collect your email address and any information you include in your message.
            </li>
            <li>
              <strong>Name for certificates</strong> — if you choose to generate a completion
              certificate, you provide your name. For signed-in users, certificate-related progress
              may be stored in your account.
            </li>
            <li>
              <strong>Feedback and correspondence</strong> — any messages, survey responses, or
              feedback you submit to us.
            </li>
          </ul>
          <h3>Data collected automatically</h3>
          <ul>
            <li>
              <strong>Usage data</strong> — pages visited, content interacted with, time spent on
              the platform, and navigation paths, collected via analytics tools.
            </li>
            <li>
              <strong>Device and browser data</strong> — browser type, operating system, screen
              resolution, and IP address (used for geographical analytics only, not individual
              identification).
            </li>
            <li>
              <strong>Cookies and local storage</strong> — we use browser local storage and, where
              applicable, session cookies to save learning progress. See Section 6 for details.
            </li>
            <li>
              <strong>Learning progress (signed-in users)</strong> — when you are signed in, XP
              earned, lessons completed, quiz results, and dictionary activity are stored in our
              secure database (Supabase) and linked to your account.
            </li>
          </ul>
          <p>
            Where paid content or services are offered, any payment transactions are handled by
            third-party payment processors. We do <strong>not</strong> directly collect or store
            payment card data on our servers.
          </p>

          <h2>3. How We Use Your Data</h2>
          <p>We use the data we collect for the following purposes:</p>
          <ul>
            <li>
              To operate and improve the platform — understanding how content is used helps us
              prioritise what to build next.
            </li>
            <li>To provide account features, including syncing your learning progress across devices.</li>
            <li>To respond to your enquiries and communicate with you when you contact us.</li>
            <li>
              To send platform updates or new content notifications, only where you have given us
              your email address and consented to receive such communications.
            </li>
            <li>To comply with our legal obligations under applicable Nigerian and international data protection law.</li>
            <li>To detect and prevent security threats, fraud, and abuse.</li>
          </ul>
          <p>
            We do <strong>not</strong> sell your personal data to any third party. We do not use your
            data for automated decision-making or profiling that produces legal or similarly
            significant effects.
          </p>

          <h2>4. Legal Basis for Processing</h2>
          <p>
            Where the General Data Protection Regulation (GDPR) or the Nigeria Data Protection Act
            (NDPA) applies, we process your personal data on the following legal grounds:
          </p>
          <ul>
            <li>
              <strong>Legitimate interests</strong> — for analytics and platform improvement, where
              this does not override your rights and freedoms.
            </li>
            <li>
              <strong>Consent</strong> — for marketing communications, which you can withdraw at any
              time.
            </li>
            <li>
              <strong>Contract</strong> — where processing is necessary to provide a service you
              have requested (including maintaining your account and learning progress).
            </li>
            <li>
              <strong>Legal obligation</strong> — where we are required to process data to comply
              with applicable law.
            </li>
          </ul>

          <h2>5. Third-Party Services</h2>
          <p>
            We use a small number of third-party services to operate the platform. Each has its own
            privacy policy and processes data in accordance with applicable law.
          </p>
          <ul>
            <li>
              <strong>Netlify</strong> — our website hosting provider. Netlify may collect server
              logs including IP addresses as part of standard hosting operations. See{" "}
              <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">
                Netlify&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Supabase</strong> — our authentication and database provider. When you create
              an account, Supabase stores your account credentials and learning progress data on our
              behalf. See{" "}
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
                Supabase&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Google Fonts</strong> — we use Google Fonts for typography. Google may collect
              limited data when fonts are loaded. See{" "}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Google&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Analytics</strong> — we may use a privacy-respecting analytics tool to
              understand aggregate platform usage. We do not share individual user data with
              analytics providers in a form that identifies you personally.
            </li>
          </ul>
          <p>
            We currently do not use Facebook Pixel, Google Ads tracking, or any advertising-focused
            tracking technology on this platform. If we introduce such technology in the future, we
            will update this Privacy Policy accordingly and, where required by applicable law, seek
            your consent before doing so.
          </p>

          <h2>6. Cookies and Browser Storage</h2>
          <p>
            Rewardology Academy uses <strong>browser local storage</strong> to save learning progress
            for visitors who are not signed in — including XP earned, lessons completed, quiz
            results, and dictionary terms read. This data lives in your browser on your device and is
            not linked to an account unless you sign in.
          </p>
          <p>
            When you <strong>create a free account and sign in</strong>, your learning progress (XP,
            completed lessons, quiz results, dictionary activity, and related profile data) is stored
            in our secure Supabase database and associated with your account. This allows your
            progress to sync across devices when you are signed in.
          </p>
          <p>
            You can clear locally stored data at any time by clearing your browser&apos;s local
            storage or browsing data. To delete account-linked progress, contact us or delete your
            account where that option is available.
          </p>
          <p>
            We may use minimal functional cookies for platform operation (such as session management
            and authentication). We currently do not use advertising or tracking cookies.
          </p>

          <h2>7. Data Retention</h2>
          <p>We retain personal data only as long as necessary for the purposes described in this policy:</p>
          <ul>
            <li>
              Account and learning progress data — retained while your account is active, and for up
              to 90 days after account deletion unless a longer period is required by law.
            </li>
            <li>
              Email enquiries and correspondence — retained for up to 3 years from the date of last
              contact, then deleted.
            </li>
            <li>
              Analytics data — retained in aggregated, anonymised form indefinitely; individual-level
              data retained for up to 26 months.
            </li>
            <li>
              Learning progress stored only in your browser — retained until you clear your browser
              data. We have no control over this data unless you are signed in.
            </li>
          </ul>

          <h2>8. Your Rights</h2>
          <p>Depending on your location, you may have the following rights regarding your personal data:</p>
          <ul>
            <li>
              <strong>Access</strong> — the right to receive a copy of the personal data we hold
              about you.
            </li>
            <li>
              <strong>Correction</strong> — the right to ask us to correct inaccurate data.
            </li>
            <li>
              <strong>Erasure</strong> — the right to ask us to delete your personal data, subject to
              certain legal exceptions.
            </li>
            <li>
              <strong>Restriction</strong> — the right to ask us to restrict processing of your data
              in certain circumstances.
            </li>
            <li>
              <strong>Portability</strong> — the right to receive your data in a structured,
              machine-readable format.
            </li>
            <li>
              <strong>Objection</strong> — the right to object to processing based on legitimate
              interests.
            </li>
            <li>
              <strong>Withdrawal of consent</strong> — where we process data on the basis of consent,
              you may withdraw that consent at any time.
            </li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will
            respond within 30 days. If you are an EU or UK resident and believe your rights have not
            been adequately addressed, you have the right to lodge a complaint with your local
            supervisory authority. If you are a Nigerian resident, you may contact the Nigeria Data
            Protection Commission (NDPC).
          </p>

          <h2>9. International Data Transfers</h2>
          <p>
            Rewardology Academy serves a global audience. Your data may be processed in countries
            outside your own, including Nigeria and countries where our third-party service providers
            operate. We take reasonable steps to ensure that any such transfers comply with
            applicable data protection law and that your data receives an adequate level of
            protection.
          </p>

          <h2>10. Children&apos;s Privacy</h2>
          <p>
            Rewardology Academy is a professional learning platform designed for adults working in or
            entering the HR profession. We do not knowingly collect personal data from individuals
            under the age of 16. If you believe a child has provided us with personal data, please
            contact us and we will delete it promptly.
          </p>

          <h2>11. Security</h2>
          <p>
            We take appropriate technical and organisational measures to protect your personal data
            against unauthorised access, disclosure, alteration, or destruction. However, no internet
            transmission is completely secure, and we cannot guarantee the absolute security of data
            transmitted to or from the platform.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &quot;Last updated&quot; date at the top of this page. For significant changes, we will
            take reasonable steps to notify you — for example, by posting a notice on the platform.
            Your continued use of Rewardology Academy after changes take effect constitutes your
            acceptance of the revised policy.
          </p>

          <h2>13. Contact Us</h2>
          <p>For any privacy-related questions, requests, or concerns, please contact us at:</p>
          <p>
            <strong>Rewardology Academy</strong>
            <br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <br />
            Website: <Link href="/">rewardologyacademy.com</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
