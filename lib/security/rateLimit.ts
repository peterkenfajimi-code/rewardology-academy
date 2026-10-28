import { createHmac } from "crypto";
import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { clientIpFromHeaders } from "@/lib/geo/resolveLocation";

type WindowBucket = { count: number; resetAt: number };
type LockBucket = { failures: number; windowStart: number; lockedUntil: number };

const windows = new Map<string, WindowBucket>();
const locks = new Map<string, LockBucket>();

export function clientIp(req: Request): string {
  return clientIpFromHeaders(req.headers) || "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
};

export function consumeRateLimit(
  scope: string,
  key: string,
  limit: number,
  windowMs: number,
  now = Date.now()
): RateLimitResult {
  const id = `${scope}:${key}`;
  const existing = windows.get(id);
  if (!existing || existing.resetAt <= now) {
    windows.set(id, { count: 1, resetAt: now + windowMs });
    prune(windows, now);
    return { ok: true, remaining: Math.max(0, limit - 1), retryAfterSec: Math.ceil(windowMs / 1000) };
  }
  existing.count += 1;
  const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec };
  }
  return { ok: true, remaining: Math.max(0, limit - existing.count), retryAfterSec };
}

export function rateLimitResponse(result: RateLimitResult): NextResponse | null {
  if (result.ok) return null;
  return NextResponse.json(
    { error: "Too many requests. Try again shortly." },
    {
      status: 429,
      headers: { "Retry-After": String(result.retryAfterSec) },
    }
  );
}

export function isAuthLocked(scope: string, key: string, now = Date.now()): number {
  const bucket = locks.get(`${scope}:${key}`);
  if (!bucket || bucket.lockedUntil <= now) return 0;
  return Math.max(1, Math.ceil((bucket.lockedUntil - now) / 1000));
}

export function registerAuthFailure(
  scope: string,
  key: string,
  maxFailures: number,
  windowMs: number,
  lockMs: number,
  now = Date.now()
): number {
  const id = `${scope}:${key}`;
  const existing = locks.get(id);
  if (!existing || now - existing.windowStart > windowMs) {
    locks.set(id, { failures: 1, windowStart: now, lockedUntil: 0 });
    return 0;
  }
  existing.failures += 1;
  if (existing.failures >= maxFailures) {
    existing.lockedUntil = now + lockMs;
    return Math.ceil(lockMs / 1000);
  }
  return 0;
}

export function clearAuthFailures(scope: string, key: string) {
  locks.delete(`${scope}:${key}`);
}

function hmacSecret(): string | null {
  const dedicated = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;
  const session = process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim();
  if (session && Buffer.byteLength(session, "utf8") >= 32) return session;
  return null;
}

function bucketId(scope: string, key: string): string | null {
  const secret = hmacSecret();
  if (!secret) return null;
  return createHmac("sha256", secret).update(`${scope}\0${key}`).digest("base64url");
}

let loggedRemoteMiss = false;

function noteRemoteMiss(reason: string) {
  if (loggedRemoteMiss) return;
  loggedRemoteMiss = true;
  console.warn("[rate-limit] shared store unavailable, using in-memory fallback:", reason);
}

async function academyClient() {
  if (!isSupabaseConfigured()) return null;
  const { createClient } = await import("@/lib/supabase/server");
  return createClient();
}

/**
 * Shared counter (Supabase) so Netlify instances agree. Falls back to memory
 * if the table/RPC is missing so a failed migration cannot take the site down.
 */
export async function consumeSharedRateLimit(
  scope: string,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const id = bucketId(scope, key);
  if (id) {
    try {
      const supabase = await academyClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("consume_rate_limit", {
          p_id: id,
          p_limit: limit,
          p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
        });
        if (!error && data) {
          const parsed = (typeof data === "string" ? JSON.parse(data) : data) as RateLimitResult;
          if (typeof parsed?.ok === "boolean") {
            return {
              ok: parsed.ok,
              remaining: Math.max(0, Number(parsed.remaining) || 0),
              retryAfterSec: Math.max(1, Number(parsed.retryAfterSec) || 1),
            };
          }
        }
        if (error) noteRemoteMiss(error.message);
      }
    } catch (err) {
      noteRemoteMiss(err instanceof Error ? err.message : "rpc failed");
    }
  }
  return consumeRateLimit(scope, key, limit, windowMs);
}

export async function isAuthLockedShared(scope: string, key: string): Promise<number> {
  const id = bucketId(scope, key);
  if (id) {
    try {
      const supabase = await academyClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("auth_lock_remaining", { p_id: id });
        if (!error && data != null) return Math.max(0, Number(data) || 0);
        if (error) noteRemoteMiss(error.message);
      }
    } catch (err) {
      noteRemoteMiss(err instanceof Error ? err.message : "rpc failed");
    }
  }
  return isAuthLocked(scope, key);
}

export async function registerAuthFailureShared(
  scope: string,
  key: string,
  maxFailures: number,
  windowMs: number,
  lockMs: number
): Promise<number> {
  const id = bucketId(scope, key);
  if (id) {
    try {
      const supabase = await academyClient();
      if (supabase) {
        const { data, error } = await supabase.rpc("register_auth_failure", {
          p_id: id,
          p_max_failures: maxFailures,
          p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
          p_lock_seconds: Math.max(1, Math.ceil(lockMs / 1000)),
        });
        if (!error && data != null) return Math.max(0, Number(data) || 0);
        if (error) noteRemoteMiss(error.message);
      }
    } catch (err) {
      noteRemoteMiss(err instanceof Error ? err.message : "rpc failed");
    }
  }
  return registerAuthFailure(scope, key, maxFailures, windowMs, lockMs);
}

export async function clearAuthFailuresShared(scope: string, key: string) {
  const id = bucketId(scope, key);
  if (id) {
    try {
      const supabase = await academyClient();
      if (supabase) {
        const { error } = await supabase.rpc("clear_auth_failures", { p_id: id });
        if (!error) return;
        if (error) noteRemoteMiss(error.message);
      }
    } catch (err) {
      noteRemoteMiss(err instanceof Error ? err.message : "rpc failed");
    }
  }
  clearAuthFailures(scope, key);
}
function prune(store: Map<string, WindowBucket>, now: number) {
  if (store.size < 400) return;
  for (const [id, bucket] of store) {
    if (bucket.resetAt <= now) store.delete(id);
  }
}

/** Test-only: wipe in-memory buckets. */
export function resetRateLimitStores() {
  windows.clear();
  locks.clear();
}
