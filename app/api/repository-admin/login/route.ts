import { NextResponse, type NextRequest } from "next/server";
import {
  REPOSITORY_ADMIN_COOKIE,
  issueRepositoryAdminSession,
  isRepositoryAdminAuthed,
  repositoryAdminCookieOptions,
  validateRepositoryAdminCredentials,
} from "@/lib/auth/repository-admin";
import {
  clearAuthFailuresShared,
  clientIp,
  consumeSharedRateLimit,
  isAuthLockedShared,
  rateLimitResponse,
  registerAuthFailureShared,
} from "@/lib/security/rateLimit";

const LOGIN_SCOPE = "admin-login";
const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const lockedSec = await isAuthLockedShared(LOGIN_SCOPE, ip);
  if (lockedSec) {
    return NextResponse.json(
      { error: "Too many failed sign-in attempts. Try again later." },
      { status: 429, headers: { "Retry-After": String(lockedSec) } }
    );
  }

  const ipLimit = await consumeSharedRateLimit(LOGIN_SCOPE, ip, 10, WINDOW_MS);
  const blocked = rateLimitResponse(ipLimit);
  if (blocked) return blocked;

  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = String(body.username ?? "").trim();
  const password = String(body.password ?? "");

  if (!validateRepositoryAdminCredentials(username, password)) {
    const lockSec = await registerAuthFailureShared(LOGIN_SCOPE, ip, MAX_FAILURES, WINDOW_MS, LOCK_MS);
    return NextResponse.json(
      { error: lockSec ? "Too many failed sign-in attempts. Try again later." : "Invalid credentials" },
      {
        status: lockSec ? 429 : 401,
        headers: lockSec ? { "Retry-After": String(lockSec) } : undefined,
      }
    );
  }

  const token = issueRepositoryAdminSession();
  if (!token) {
    return NextResponse.json({ error: "Admin session not configured" }, { status: 503 });
  }

  await clearAuthFailuresShared(LOGIN_SCOPE, ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(REPOSITORY_ADMIN_COOKIE, token, repositoryAdminCookieOptions());
  return res;
}

export function GET(req: NextRequest) {
  return NextResponse.json({ authenticated: isRepositoryAdminAuthed(req) });
}
