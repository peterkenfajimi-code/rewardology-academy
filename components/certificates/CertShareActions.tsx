"use client";

import { useState } from "react";
import { linkedInCertificationUrl } from "@/lib/certificates/linkedin";

type Props = {
  certId: string;
  verifyUrl: string;
  credentialName: string;
  issuedAt?: string;
  className?: string;
  linkedInClassName?: string;
  copyClassName?: string;
};

export function CertShareActions({
  certId,
  verifyUrl,
  credentialName,
  issuedAt,
  className = "cert-share-actions",
  linkedInClassName = "cert-share-btn cert-share-linkedin",
  copyClassName = "cert-share-btn cert-share-copy",
}: Props) {
  const [copied, setCopied] = useState(false);

  const linkedInUrl = linkedInCertificationUrl({
    credentialName,
    certId,
    issuedAt: issuedAt ?? new Date().toISOString(),
  });

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={className}>
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkedInClassName}
      >
        Add to LinkedIn
      </a>
      <button type="button" className={copyClassName} onClick={copyLink}>
        {copied ? "Link copied" : "Copy verify link"}
      </button>
    </div>
  );
}
