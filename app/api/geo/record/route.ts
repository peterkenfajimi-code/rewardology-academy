import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { resolveLocation } from "@/lib/geo/resolveLocation";

const UNAUTH = NextResponse.json({ ok: false }, { status: 401 });

/** Record approximate location for the signed-in user (once per session on the client). */
export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return UNAUTH;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return UNAUTH;

  const geo = await resolveLocation(request);
  if (!geo.countryCode) {
    return NextResponse.json({ ok: true, recorded: false });
  }

  const { error } = await supabase.rpc("record_user_location", {
    p_country_code: geo.countryCode,
    p_country_name: geo.countryName,
    p_region: geo.region,
    p_city: geo.city,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, recorded: true });
}
