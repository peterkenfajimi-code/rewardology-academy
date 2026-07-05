import { certificateVerifyUrl } from "@/lib/certificates/urls";

const ISSUER_NAME = "Rewardology Academy";

export function linkedInCertificationUrl(opts: {
  credentialName: string;
  certId: string;
  issuedAt: Date | string;
}): string {
  const date = typeof opts.issuedAt === "string" ? new Date(opts.issuedAt) : opts.issuedAt;
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: opts.credentialName,
    organizationName: ISSUER_NAME,
    issueYear: String(date.getFullYear()),
    issueMonth: String(date.getMonth() + 1),
    certUrl: certificateVerifyUrl(opts.certId),
    certId: opts.certId,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export function certTypeLabel(certType: string): string {
  switch (certType) {
    case "course":
      return "Course Certificate";
    case "quiz_centre":
      return "Quiz Centre Certificate";
    case "quiz":
      return "Quiz Certificate";
    default:
      return "Certificate";
  }
}
