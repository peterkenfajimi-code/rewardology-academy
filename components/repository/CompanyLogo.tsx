"use client";

import { useState } from "react";
import { companyInitials, companyLogoUrl } from "@/lib/repository/company-logo";
import "@/styles/benefits-repository.css";

type Props = {
  name: string;
  logoPath?: string | null;
  size?: number;
};

export function CompanyLogo({ name, logoPath, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);
  const url = companyLogoUrl(logoPath);
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (url && !failed) {
    return (
      <span className="benefits-repo-logo" style={style}>
        <img src={url} alt={`${name} logo`} loading="lazy" onError={() => setFailed(true)} />
      </span>
    );
  }

  return (
    <span className="benefits-repo-logo benefits-repo-logo-initials" style={style} aria-hidden="true">
      {companyInitials(name)}
    </span>
  );
}
