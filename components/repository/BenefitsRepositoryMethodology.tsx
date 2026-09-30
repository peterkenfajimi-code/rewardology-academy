import Link from "next/link";
import { SOURCE_RECENCY_YEARS } from "@/lib/repository/collection-policy";
import { loadRepositoryCoverage } from "@/lib/repository/coverage";
import { STALENESS_MONTHS } from "@/lib/repository/staleness";
import { CONTACT_EMAIL } from "@/lib/site";
import "@/styles/benefits-repository.css";

const LAST_REVIEWED = "30 September 2026";

const SOURCES = [
  {
    name: "Annual & sustainability reports",
    gives:
      "Audited financial disclosures and voluntary reporting on pay, pensions, and benefits — the strongest source, since public companies are legally required to disclose employee benefit obligations under accounting standards like IAS 19.",
  },
  { name: "Careers pages", gives: "How companies describe their benefits to prospective employees." },
  {
    name: "Press releases",
    gives:
      "Dated, specific announcements — a new health partnership, a policy change — that help us pin down when something changed.",
  },
  {
    name: "Regulatory filings",
    gives:
      "Confirmation of statutory compliance (pension registration, workplace insurance) from the relevant regulator.",
  },
  {
    name: "LinkedIn",
    gives: "Public posts from companies and, where relevant, named HR leaders describing their own programs.",
  },
  {
    name: "Award submissions",
    gives:
      "Entries to recognized employer awards (e.g., Great Place to Work), which often require more specific disclosure than routine marketing.",
  },
  { name: "Direct outreach", gives: "Confirmation requested directly from a company, on the record." },
];

export async function BenefitsRepositoryMethodology() {
  const coverage = await loadRepositoryCoverage();

  return (
    <div className="benefits-repo benefits-repo-methodology">
      <nav className="benefits-repo-breadcrumb">
        <Link href="/benefits-repository">Directory</Link>
        <span aria-hidden> / </span>
        <span>Methodology</span>
      </nav>

      <header className="benefits-repo-hero">
        <p className="benefits-repo-eyebrow">Research pillar · Methodology &amp; About</p>
        <h1>About This Repository</h1>
        <p>
          The Africa Benefits Repository is an independent research project that documents how employers
          across Africa structure compensation, retirement, health, and other workplace benefits — country by
          country, source by source, with every fact traceable back to where it came from.
        </p>
      </header>

      <section className="benefits-repo-methodology-section">
        <p>
          <strong>Everything in this repository is built from publicly available information.</strong> No entry
          here comes from confidential company records, internal HR systems, anything shared with us in
          confidence, or documents a company marks as internal — even when they can be found online. Every
          fact is either published by the company itself — in an annual report, on a careers page, in a press
          release, in a regulatory filing, on a company&apos;s own social media — or confirmed directly with the
          company on the record. If we can&apos;t point to where a fact came from, it doesn&apos;t appear here.
        </p>
        <p>
          This project is built and maintained by Rewardology Academy, a Total Rewards learning and
          intelligence platform. It is not affiliated with, sponsored by, or endorsed by any of the companies
          it covers.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>Where the Data Comes From</h2>
        <p>
          We collect information from seven public source types — our seven-source framework — each with its
          own reliability profile:
        </p>
        <table className="benefits-repo-methodology-table">
          <thead>
            <tr>
              <th scope="col">Source</th>
              <th scope="col">What it gives us</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s) => (
              <tr key={s.name}>
                <th scope="row">{s.name}</th>
                <td>{s.gives}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          Sources are not weighted equally: annual and sustainability reports and direct confirmation carry
          the most weight, regulatory filings and press releases sit in the middle, and careers pages,
          LinkedIn, and award submissions are weighted lower because they can be marketing-led or incomplete.
          No single source type is treated as sufficient on its own. Wherever possible, we cross-check a
          finding from one source type against another before treating it as established.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>How We Score Confidence</h2>
        <p>Every fact in the repository carries a confidence level, so you can see at a glance how well-supported it is:</p>
        <ul>
          <li>
            <strong>High</strong> — Backed by an audited disclosure or a specific, named, dated statement from
            the company itself (e.g., a stated pension contribution rate, cited to a page number in an annual
            report).
          </li>
          <li>
            <strong>Medium</strong> — A real program or policy is described, but without full quantification
            (e.g., &ldquo;the company provides health coverage for staff and dependents&rdquo; without naming
            the provider or the scope).
          </li>
          <li>
            <strong>Low</strong> — Vague or promotional language with no independently checkable claim.
            Low-confidence findings are not published as facts; they&apos;re held for further verification.
          </li>
        </ul>
        <p>
          We also distinguish a company&apos;s own specific disclosure from a country&apos;s general statutory
          minimum. If a company states a pension contribution rate that happens to match the legal minimum, we
          verify the company actually said so — rather than assuming the statutory floor applies to it by
          default. In the same way, accounting-policy wording that only defines a category of cost — for
          example, a standard definition of short-term benefits that mentions medical aid — is not taken as
          evidence that the company provides that benefit.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>How Conflicting Information Is Handled</h2>
        <p>
          When two sources disagree — say, a careers page states one figure and a more recent annual report
          states another — we don&apos;t silently pick one or average them. The higher-trust, better-verified
          source is published; the other is kept on record as <strong>pending verification</strong> rather than
          discarded, and superseded findings stay in our review history with the reason recorded rather than
          disappearing. Corrections demote an entry rather than delete it.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>Recency</h2>
        <p>
          Figures and other time-sensitive disclosures must fall within a {SOURCE_RECENCY_YEARS}-year collection
          window, or they are hidden from the public directory. Structural facts — statutory compliance status,
          or what type of pension or gratuity scheme a company runs — stay visible regardless of age, with a
          staleness badge when they are more than {STALENESS_MONTHS} months old so they can be re-checked.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>What This Repository Is Not</h2>
        <ul>
          <li>
            <strong>Not an endorsement.</strong> A company&apos;s inclusion here — or the absence of an entry in
            a given category — says nothing about how generous or well-run its benefits are relative to others.
            It only reflects what has been publicly disclosed and verified so far.
          </li>
          <li>
            <strong>Not comprehensive by design.</strong> Coverage grows source by source and company by
            company. An empty category for a given company means we haven&apos;t yet found a verifiable public
            disclosure in that area — not that the benefit doesn&apos;t exist.
          </li>
          <li>
            <strong>Not a certification.</strong> Companies listed here have not reviewed, approved, or
            sponsored their entries. Company names and logos, where used, identify the subject of publicly
            sourced research and remain the trademarks of their respective owners.
          </li>
        </ul>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>Found Something Inaccurate?</h2>
        <p>
          If you believe an entry here misrepresents a public disclosure, or you&apos;re associated with a
          listed company and can point us to a more current or accurate public source, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}?subject=Africa%20Benefits%20Repository%20correction`}>
            {CONTACT_EMAIL}
          </a>{" "}
          — we&apos;ll review it against the original source and correct or update the entry with the same
          discipline we apply to every other fact here.
        </p>
      </section>

      <p className="benefits-repo-muted">
        Last reviewed: {LAST_REVIEWED}
        {coverage ? (
          <>
            {" "}
            · Countries covered: {coverage.countries.join(", ")} · Companies covered: {coverage.companies}
          </>
        ) : null}{" "}
        · <Link href="/benefits-repository">Full company index</Link>
      </p>
    </div>
  );
}
