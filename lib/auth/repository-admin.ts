import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import type { NextRequest } from "next/server";

export const REPOSITORY_ADMIN_COOKIE = "ra_repository_admin";
export const REPOSITORY_ADMIN_SESSION_TTL_SEC = 12 * 60 * 60;

const MIN_SESSION_SECRET_BYTES = 32;

function sessionSecret(): string | null {
  const secret = process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim() || null;
  const password = process.env.REPOSITORY_ADMIN_PASSWORD?.trim() || "";
  if (!secret || Buffer.byteLength(secret, "utf8") < MIN_SESSION_SECRET_BYTES) return null;
  // HMAC key must not be the login password — reuse would let a guessed
  // password forge cookies, and rotation of one would not revoke the other.
  if (password && safeEqual(secret, password)) return null;
  return secret;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function digest(value: string): Buffer {
  return createHmac("sha256", "ra-credential-compare").update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  const left = digest(a);
  const right = digest(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function issueRepositoryAdminSession(): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + REPOSITORY_ADMIN_SESSION_TTL_SEC;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${exp}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isRepositoryAdminAuthed(req: NextRequest): boolean {
  const secret = sessionSecret();
  const token = req.cookies.get(REPOSITORY_ADMIN_COOKIE)?.value;
  if (!secret || !token) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [version, expRaw, nonce, signature] = parts;
  const payload = `${version}.${expRaw}.${nonce}`;
  const expected = sign(payload, secret);
  if (!safeEqual(expected, signature)) return false;

  const exp = Number(expRaw);
  return Number.isFinite(exp) && exp >= Math.floor(Date.now() / 1000);
}

export function validateRepositoryAdminCredentials(
  username: string,
  password: string
): boolean {
  const expectedUser = process.env.REPOSITORY_ADMIN_USERNAME?.trim();
  const expectedPass = process.env.REPOSITORY_ADMIN_PASSWORD?.trim();
  if (!expectedUser || !expectedPass) return false;
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

export function repositoryAdminCookieOptions(maxAge = REPOSITORY_ADMIN_SESSION_TTL_SEC) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}
