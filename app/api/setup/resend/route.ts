import { NextResponse } from "next/server";
import { checkResendHealth } from "@/lib/resend/health";

export const runtime = "nodejs";

export async function GET() {
  const health = await checkResendHealth();
  return NextResponse.json(health);
}
