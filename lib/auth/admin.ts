import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { CONTACT_FORWARD_GMAIL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";

export function isPlatformAdminEmail(email: string | undefined | null): boolean {
  const adminEmail = CONTACT_FORWARD_GMAIL.toLowerCase();
  if (!adminEmail) return false;
  return email?.toLowerCase() === adminEmail;
}

export function isPlatformAdminConfigured(): boolean {
  return CONTACT_FORWARD_GMAIL.length > 0;
}

/** Server-side gate: signed-in user's email, never the public env value alone. */
export async function requirePlatformAdmin() {
  if (!isSupabaseConfigured() || !isPlatformAdminConfigured()) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isPlatformAdminEmail(user?.email)) {
    return { ok: false as const, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ok: true as const, supabase, user };
}
