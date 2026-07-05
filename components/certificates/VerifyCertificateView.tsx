import Link from "next/link";
import { certTypeLabel } from "@/lib/certificates/linkedin";
import type { PublicCertificate } from "@/lib/certificates/types";
import "@/styles/certificates.css";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function VerifyCertificateView({ cert }: { cert: PublicCertificate }) {
  return (
    <div className="cert-verify-root">
      <div className="cert-verify-card">
        <div className="cert-verify-badge">✓ Verified Credential</div>
        <div className="cert-verify-logo">
          <span className="cert-verify-mark">R</span>
          <span>Rewardology Academy</span>
        </div>

        <p className="cert-verify-eyebrow">{certTypeLabel(cert.certType)}</p>
        <h1 className="cert-verify-title">{cert.credentialName}</h1>

        {cert.credentialDetail && (
          <p className="cert-verify-detail">{cert.credentialDetail}</p>
        )}

        <div className="cert-verify-recipient">
          <span className="cert-verify-lbl">Awarded to</span>
          <span className="cert-verify-name">{cert.recipientName}</span>
        </div>

        <div className="cert-verify-meta">
          <div>
            <span className="cert-verify-lbl">Issued</span>
            <span>{formatDate(cert.issuedAt)}</span>
          </div>
          {cert.scorePct != null && (
            <div>
              <span className="cert-verify-lbl">Score</span>
              <span>{cert.scorePct}%</span>
            </div>
          )}
          {cert.xpEarned != null && cert.xpEarned > 0 && (
            <div>
              <span className="cert-verify-lbl">XP earned</span>
              <span>{cert.xpEarned.toLocaleString()}</span>
            </div>
          )}
          <div>
            <span className="cert-verify-lbl">Credential ID</span>
            <span className="cert-verify-id">{cert.id}</span>
          </div>
        </div>

        <p className="cert-verify-foot">
          This credential was issued by Rewardology Academy. Share this page URL on LinkedIn
          under Licenses &amp; Certifications.
        </p>

        <Link href="/courses" className="cert-verify-cta">
          Explore Rewardology Academy →
        </Link>
      </div>
    </div>
  );
}

export function VerifyCertificateNotFound({ id }: { id: string }) {
  return (
    <div className="cert-verify-root">
      <div className="cert-verify-card cert-verify-missing">
        <h1 className="cert-verify-title">Credential not found</h1>
        <p className="cert-verify-detail">
          No verified certificate matches <strong>{id}</strong>. Check the ID and try again.
        </p>
        <Link href="/" className="cert-verify-cta">
          Back to Rewardology Academy
        </Link>
      </div>
    </div>
  );
}
