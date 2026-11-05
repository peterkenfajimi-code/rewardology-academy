import { CONTACT_EMAIL } from "@/lib/site";

export function repositoryCorrectionMailto(companyName?: string): string {
  const subject = companyName
    ? `Africa Benefits Repository correction — ${companyName}`
    : "Africa Benefits Repository correction";
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}
