import Link from "next/link";
import { SOURCE_RECENCY_YEARS } from "@/lib/repository/collection-policy";
import "@/styles/benefits-repository.css";

export function BenefitsRepositoryMethodology() {
  return (
    <div className="benefits-repo benefits-repo-methodology">
      <nav className="benefits-repo-breadcrumb">
        <Link href="/benefits-repository">Directory</Link>
        <span aria-hidden> / </span>
        <span>Methodology</span>
      </nav>

      <header className="benefits-repo-hero">
        <p className="benefits-repo-eyebrow">Research pillar · Preview</p>
        <h1>How confidence is scored</h1>
        <p>
          Plain-language explanation of how the Africa Benefits Repository weighs sources, assigns
          confidence, and handles conflicting data.
        </p>
      </header>

      <section className="benefits-repo-methodology-section">
        <h2>Source trust</h2>
        <p>
          Not all disclosures carry equal weight. Annual reports, sustainability reports, and direct
          company confirmations are treated as the strongest evidence. Regulatory filings and press
          releases sit in the middle. Careers pages, LinkedIn posts, and award listings are useful
          signals but are weighted lower because they may be marketing-oriented or incomplete.
        </p>
        <ul>
          <li>
            <strong>Highest trust:</strong> annual reports, sustainability reports, direct confirmation
          </li>
          <li>
            <strong>Medium trust:</strong> regulatory filings, press releases
          </li>
          <li>
            <strong>Lower trust:</strong> careers pages, LinkedIn, award recognition
          </li>
        </ul>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>What High, Medium, and Low mean</h2>
        <p>
          Each published field carries a confidence label derived from the source type, specificity of
          the disclosure, and whether the value maps cleanly to the canonical field registry.
        </p>
        <ul>
          <li>
            <strong>High:</strong> explicit, quantified, or clearly named in a high-trust document
          </li>
          <li>
            <strong>Medium:</strong> plausible and sourced, but partial, indirect, or from a lower-trust
            channel
          </li>
          <li>
            <strong>Low:</strong> weak signal, ambiguous wording, or limited corroboration — still shown
            when reviewed, with the label visible
          </li>
        </ul>
        <p>
          Some fields have registry rules that cap confidence regardless of source (for example,
          narrative-only disclosures). When that happens, the entry notes that confidence was capped.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>Conflicts are queued, not silently overwritten</h2>
        <p>
          When a new extraction disagrees with an existing published value from a comparable or
          lower-trust source, the conflict is saved as pending verification rather than silently
          replacing the published row. Reviewers decide whether to publish, supersede, or discard.
        </p>
      </section>

      <section className="benefits-repo-methodology-section">
        <h2>Recency and staleness</h2>
        <p>
          Quantified figures and other time-sensitive disclosures must fall within a{" "}
          {SOURCE_RECENCY_YEARS}-year collection window or they are hidden from the public directory.
          Structural and existence fields — Yes/No compliance disclosures and selected scheme-type
          fields such as pension scheme type — are kept visible regardless of age; they may show a
          staleness badge when their effective date is more than 24 months old, signalling that the
          fact should be re-checked without removing it from browse results.
        </p>
      </section>

      <p className="benefits-repo-muted">
        <Link href="/benefits-repository">← Back to directory</Link>
      </p>
    </div>
  );
}
