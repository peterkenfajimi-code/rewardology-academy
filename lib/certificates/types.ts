export type CertificateType = "course" | "quiz_centre" | "quiz";

export type PublicCertificate = {
  id: string;
  certType: CertificateType;
  sourceId: string;
  recipientName: string;
  credentialName: string;
  credentialDetail: string | null;
  scorePct: number | null;
  xpEarned: number | null;
  issuedAt: string;
  verified: boolean;
};

export type IssueCertificatePayload = {
  certType: CertificateType;
  sourceId: string;
  recipientName: string;
  credentialName: string;
  credentialDetail?: string;
  scorePct?: number;
  xpEarned?: number;
};

export type IssuedCertificateResponse = {
  id: string;
  verifyUrl: string;
};
