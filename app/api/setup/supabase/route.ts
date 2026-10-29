import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/admin";
import { checkSupabaseHealth } from "@/lib/supabase/health";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;
  const health = await checkSupabaseHealth();
  return NextResponse.json(health);
}
