import type { NextRequest } from "next/server";

export const REPOSITORY_ADMIN_COOKIE = "ra_repository_admin";
export const REPOSITORY_ADMIN_SESSION_TTL_SEC = 12 * 60 * 60;

const MIN_SESSION_SECRET_BYTES = 32;
const encoder = new TextEncoder();

function sessionSecret(): string | null {
  const secret = process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim() || null;
  if (!secret || encoder.encode(secret).length < MIN_SESSION_SECRET_BYTES) return null;
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array | null {
  try {
    const pad = "=".repeat((4 - (value.length % 4)) % 4);
    const bin = atob(value.replace(/-/g, "+").replace(/_/g, "/") + pad);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return null;
  }
}

async function hmacSha256(secret: string, payload: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const buf = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return new Uint8Array(buf);
}

function timingSafeEqualBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function safeEqual(a: string, b: string): Promise<boolean> {
  const [left, right] = await Promise.all([
    hmacSha256("ra-credential-compare", a),
    hmacSha256("ra-credential-compare", b),
  ]);
  return timingSafeEqualBytes(left, right);
}

export async function issueRepositoryAdminSession(): Promise<string | null> {
  const secret = sessionSecret();
  const password = process.env.REPOSITORY_ADMIN_PASSWORD?.trim() || "";
  if (!secret) return null;
  if (password && (await safeEqual(secret, password))) return null;

  const exp = Math.floor(Date.now() / 1000) + REPOSITORY_ADMIN_SESSION_TTL_SEC;
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `v1.${exp}.${nonce}`;
  const signature = toBase64Url(await hmacSha256(secret, payload));
  return `${payload}.${signature}`;
}

export async function isRepositoryAdminAuthed(req: NextRequest): Promise<boolean> {
  const secret = sessionSecret();
  const token = req.cookies.get(REPOSITORY_ADMIN_COOKIE)?.value;
  const password = process.env.REPOSITORY_ADMIN_PASSWORD?.trim() || "";
  if (!secret || !token) return false;
  if (password && (await safeEqual(secret, password))) return false;

  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return false;
  const [version, expRaw, nonce, signature] = parts;
  const payload = `${version}.${expRaw}.${nonce}`;
  const expected = await hmacSha256(secret, payload);
  const given = fromBase64Url(signature);
  if (!given || !timingSafeEqualBytes(expected, given)) return false;

  const exp = Number(expRaw);
  return Number.isFinite(exp) && exp >= Math.floor(Date.now() / 1000);
}

export async function validateRepositoryAdminCredentials(
  username: string,
  password: string
): Promise<boolean> {
  const expectedUser = process.env.REPOSITORY_ADMIN_USERNAME?.trim();
  const expectedPass = process.env.REPOSITORY_ADMIN_PASSWORD?.trim();
  if (!expectedUser || !expectedPass) return false;
  const userOk = await safeEqual(username, expectedUser);
  const passOk = await safeEqual(password, expectedPass);
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
