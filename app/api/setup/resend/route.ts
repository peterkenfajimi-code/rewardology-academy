import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/admin";
import { checkResendHealth } from "@/lib/resend/health";
import { clientIp, consumeRateLimit, rateLimitResponse } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;
  const limited = rateLimitResponse(consumeRateLimit("setup-resend", clientIp(req), 20, 15 * 60 * 1000));
  if (limited) return limited;
  const health = await checkResendHealth();
  return NextResponse.json(health);
}
