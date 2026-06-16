import Link from "next/link";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import "@/styles/static-pages.css";

const LEGAL_DATE = "1 June 2026";

export function TermsPage() {
  return (
    <div className="sp-root">
      <StaticPageHero
        eyebrow="Legal"
        title={
          <>
            Terms of <em>Service</em>
          </>
        }
        subtitle="The rules that govern your use of Rewardology Academy."
        updated={`Effective date: ${LEGAL_DATE} · Last updated: ${LEGAL_DATE}`}
      />

      <div className="sp-content">
        <div className="sp-legal-intro">
          These Terms of Service (&quot;<strong>Terms</strong>&quot;) govern your access to and use
          of Rewardology Academy, accessible at <Link href="/">rewardologyacademy.com</Link> (the
          &quot;<strong>Platform</strong>&quot;). By accessing or using the Platform, you agree to be
          bound by these Terms. If you do not agree, please do not use the Platform.
        </div>

        <div className="sp-legal-body">
          <h2>1. About the Platform</h2>
          <p>
            Rewardology Academy is an online learning platform providing educational content on Total
            Rewards, Compensation, Benefits, Pay Equity, HR Analytics, and related disciplines. The
            Platform includes structured courses, articles, quizzes, a reference dictionary, an
            illustrated comics series, and a progress tracking system.
          </p>
          <p>
            The Platform is operated by Rewardology Academy (&quot;<strong>we</strong>&quot;, &quot;
            <strong>us</strong>&quot;, or &quot;<strong>our</strong>&quot;). Content on the Platform
            may be offered on a free or paid basis, as indicated at the point of access.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 16 years old to use this Platform. By using the Platform, you
            represent and warrant that you meet this age requirement. The Platform is designed for HR
            professionals, students, and individuals with a professional interest in Total Rewards and
            related disciplines.
          </p>

          <h2>3. Access and Use</h2>
          <p>
            Subject to these Terms, we grant you a personal, non-exclusive, non-transferable, revocable
            licence to access and use the Platform for your own personal educational and professional
            development purposes.
          </p>
          <p>You agree not to:</p>
          <ul>
            <li>
              Reproduce, duplicate, copy, sell, resell, or exploit any content on the Platform for
              commercial purposes without our prior written consent.
            </li>
            <li>
              Systematically download, scrape, or harvest content from the Platform using automated
              tools, bots, or scripts.
            </li>
            <li>
              Attempt to gain unauthorised access to any part of the Platform, its servers, or any
              connected systems.
            </li>
            <li>
              Use the Platform in any way that is unlawful, harmful, abusive, defamatory, or
              otherwise objectionable.
            </li>
            <li>
              Transmit any unsolicited commercial communications, spam, or malware through or in
              connection with the Platform.
            </li>
            <li>Misrepresent your identity or affiliation with any organisation.</li>
            <li>Interfere with or disrupt the integrity or performance of the Platform or its content.</li>
          </ul>

          <h2>4. Intellectual Property</h2>
          <p>
            All content on Rewardology Academy — including but not limited to courses, lessons,
            articles, quiz questions, dictionary definitions, practitioner notes, worked examples,
            comics, illustrations, scripts, character designs, and the overall look and feel of the
            Platform — is the original intellectual property of Rewardology Academy and is protected
            by copyright and other applicable intellectual property laws.
          </p>
          <p>Specifically:</p>
          <ul>
            <li>
              All course content, article text, and dictionary entries are original works authored by
              Rewardology Academy and may not be reproduced, adapted, or redistributed without express
              written permission.
            </li>
            <li>
              All comics, character designs, illustrations, and visual storytelling content are
              proprietary and protected by copyright.
            </li>
            <li>Quiz questions, answer explanations, and scoring logic are proprietary to Rewardology Academy.</li>
            <li>
              The Rewardology Academy name, logo, and brand elements are proprietary and may not be
              used without permission.
            </li>
          </ul>
          <p>You are permitted to:</p>
          <ul>
            <li>Read, view, and engage with content on the Platform for your own personal educational use.</li>
            <li>
              Share links to Platform content, provided you do not reproduce substantial portions of
              the content itself.
            </li>
            <li>
              Reference concepts learned on the Platform in your professional work, provided you do
              not reproduce verbatim text or pass it off as your own.
            </li>
          </ul>
          <p>
            Any unauthorised reproduction, distribution, adaptation, or commercial exploitation of
            Rewardology Academy content — in whole or in part — is prohibited and may constitute
            copyright infringement.
          </p>

          <h2>5. Certificates and XP</h2>
          <p>
            The Platform awards XP (experience points) and completion certificates as recognition of
            learning progress. These are educational indicators only and do not constitute formal
            academic qualifications, professional certifications, or accreditations recognised by any
            external body unless explicitly stated. We reserve the right to modify the XP system,
            certificate design, and eligibility criteria at any time.
          </p>
          <p>
            For visitors who are not signed in, learning progress (XP, completed lessons, quiz results)
            is stored in your browser&apos;s local storage. When you create a free account and sign
            in, your progress is stored in our database and linked to your account so it can sync
            across devices. It is your responsibility to maintain access to your account and to back
            up any progress data you wish to retain. We are not responsible for loss of locally stored
            progress due to clearing browser data, changing devices, or other user actions.
          </p>

          <h2>6. No Warranties</h2>
          <p>
            The Platform and all content are provided &quot;<strong>as is</strong>&quot; and &quot;
            <strong>as available</strong>&quot; without warranties of any kind, express or implied. To
            the fullest extent permitted by applicable law, we disclaim all warranties, including but
            not limited to implied warranties of merchantability, fitness for a particular purpose,
            and non-infringement.
          </p>
          <p>We make no warranty that:</p>
          <ul>
            <li>The Platform will be uninterrupted, error-free, or free from harmful components.</li>
            <li>Any information on the Platform is complete, accurate, reliable, or up to date.</li>
            <li>The Platform will meet your specific professional, educational, or career requirements.</li>
          </ul>
          <p>
            Educational content on the Platform is intended to support professional development and
            should not be treated as professional legal, financial, or HR consultancy advice. Always
            exercise independent professional judgement when applying concepts learned on the Platform
            to real-world situations.
          </p>

          <h2>7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable law, Rewardology Academy and its operators
            shall not be liable for any indirect, incidental, special, consequential, or punitive
            damages, including but not limited to loss of profits, data, goodwill, or other intangible
            losses, arising out of or in connection with:
          </p>
          <ul>
            <li>Your use of or inability to use the Platform or its content.</li>
            <li>Any reliance placed on content, information, or materials on the Platform.</li>
            <li>Unauthorised access to or alteration of your data.</li>
            <li>Any other matter relating to the Platform.</li>
          </ul>
          <p>
            Our total liability to you for any claims arising from your use of the Platform shall not
            exceed the amount you paid to access the specific content or service giving rise to the
            claim in the twelve months preceding the claim.
          </p>

          <h2>8. Links to Third-Party Sites</h2>
          <p>
            The Platform may contain links to third-party websites, including news sources,
            professional bodies, and external resources. These links are provided for your convenience
            and do not constitute an endorsement of those websites or their content. We have no control
            over third-party sites and accept no responsibility for their content, privacy practices,
            or availability.
          </p>

          <h2>9. Privacy</h2>
          <p>
            Your use of the Platform is also governed by our{" "}
            <Link href="/privacy">Privacy Policy</Link>, which is incorporated into these Terms by
            reference. By using the Platform, you consent to the collection and use of your data as
            described in the Privacy Policy.
          </p>

          <h2>10. Modifications to the Platform and Terms</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any aspect of the Platform at any
            time without prior notice. We may also update these Terms at any time. When we make
            material changes, we will update the effective date at the top of this page. Your
            continued use of the Platform after such changes constitutes acceptance of the revised
            Terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We reserve the right to restrict or terminate your access to the Platform at our sole
            discretion, without notice, if we believe you have violated these Terms or applicable
            law. Upon termination, your right to use the Platform ceases immediately.
          </p>

          <h2>12. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the Federal
            Republic of Nigeria, without regard to its conflict of law principles. Any dispute arising
            from or relating to these Terms or the Platform shall be subject to the exclusive
            jurisdiction of the courts of Nigeria.
          </p>
          <p>
            We encourage you to contact us first at{" "}
            <a href="mailto:hello@rewardologyacademy.com">hello@rewardologyacademy.com</a> to resolve
            any concerns informally before initiating formal proceedings.
          </p>

          <h2>13. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you
            and Rewardology Academy with respect to your use of the Platform, and supersede any prior
            agreements or understandings, whether written or oral.
          </p>

          <h2>14. Contact Us</h2>
          <p>If you have any questions about these Terms, please contact us at:</p>
          <p>
            <strong>Rewardology Academy</strong>
            <br />
            Email: <a href="mailto:hello@rewardologyacademy.com">hello@rewardologyacademy.com</a>
            <br />
            Website: <Link href="/">rewardologyacademy.com</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
