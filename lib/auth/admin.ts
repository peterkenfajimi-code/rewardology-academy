import { CONTACT_FORWARD_GMAIL } from "@/lib/site";

export function isPlatformAdminEmail(email: string | undefined | null): boolean {
  const adminEmail = CONTACT_FORWARD_GMAIL.toLowerCase();
  if (!adminEmail) return false;
  return email?.toLowerCase() === adminEmail;
}

export function isPlatformAdminConfigured(): boolean {
  return CONTACT_FORWARD_GMAIL.length > 0;
}
