import { NextResponse } from "next/server";
import { REPOSITORY_ADMIN_COOKIE, repositoryAdminCookieOptions } from "@/lib/auth/repository-admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(REPOSITORY_ADMIN_COOKIE, "", repositoryAdminCookieOptions(0));
  return res;
}
