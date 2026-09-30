import Link from "next/link";

export function BenefitsRepositoryHero() {
  return (
    <header className="benefits-repo-hero">
      <p className="benefits-repo-eyebrow">Research pillar · Preview</p>
      <h1>Africa Benefits Repository</h1>
      <p>
        Structured employer benefits intelligence across six African markets. Published entries only —
        with confidence indicators and source citations.
      </p>
      <p>
        <Link href="/benefits-repository/methodology" className="benefits-repo-methodology-link benefits-repo-methodology-link-hero">
          How we source and score this data →
        </Link>
      </p>
    </header>
  );
}
