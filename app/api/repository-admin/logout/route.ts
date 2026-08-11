import { NextResponse } from "next/server";
import { REPOSITORY_ADMIN_COOKIE } from "@/lib/auth/repository-admin";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(REPOSITORY_ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return res;
}
