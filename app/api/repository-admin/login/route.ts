import { NextResponse, type NextRequest } from "next/server";
import {
  REPOSITORY_ADMIN_COOKIE,
  isRepositoryAdminAuthed,
  validateRepositoryAdminCredentials,
  repositoryAdminSessionToken,
} from "@/lib/auth/repository-admin";

export async function POST(req: NextRequest) {
  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!validateRepositoryAdminCredentials(username, password)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = repositoryAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Admin session not configured" }, { status: 503 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(REPOSITORY_ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}

export function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isRepositoryAdminAuthed(req) });
}
