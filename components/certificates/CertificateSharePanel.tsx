"use client";

import { CertShareActions } from "@/components/certificates/CertShareActions";
import { useIssuedCertificate } from "@/components/certificates/useIssuedCertificate";
import type { IssueCertificatePayload } from "@/lib/certificates/types";
import "@/styles/certificates.css";

type Props = {
  payload: IssueCertificatePayload | null;
  enabled: boolean;
  signedIn: boolean;
};

export function CertificateSharePanel({ payload, enabled, signedIn }: Props) {
  const { issued, loading, error } = useIssuedCertificate(payload, enabled && signedIn);

  if (!signedIn) {
    return (
      <p className="cert-share-hint">
        Sign in to get a verifiable link and add this certificate to LinkedIn.
      </p>
    );
  }

  if (loading) {
    return <p className="cert-share-loading">Creating verification link…</p>;
  }

  if (error) {
    return <p className="cert-share-error">{error}</p>;
  }

  if (!issued || !payload) return null;

  return (
    <>
      <CertShareActions
        certId={issued.id}
        verifyUrl={issued.verifyUrl}
        credentialName={payload.credentialName}
        issuedAt={issued.issuedAt}
      />
      <p className="cert-share-hint">
        Credential ID: <strong>{issued.id}</strong>
      </p>
    </>
  );
}
