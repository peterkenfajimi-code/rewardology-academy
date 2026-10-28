import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import {
  REPOSITORY_ADMIN_COOKIE,
  issueRepositoryAdminSession,
  isRepositoryAdminAuthed,
  validateRepositoryAdminCredentials,
} from "@/lib/auth/repository-admin";

const PREV = {
  user: process.env.REPOSITORY_ADMIN_USERNAME,
  pass: process.env.REPOSITORY_ADMIN_PASSWORD,
  token: process.env.REPOSITORY_ADMIN_SESSION_TOKEN,
};

afterEach(() => {
  process.env.REPOSITORY_ADMIN_USERNAME = PREV.user;
  process.env.REPOSITORY_ADMIN_PASSWORD = PREV.pass;
  process.env.REPOSITORY_ADMIN_SESSION_TOKEN = PREV.token;
});

function requestWithCookie(value: string) {
  return new NextRequest("http://localhost/repository-admin", {
    headers: { cookie: `${REPOSITORY_ADMIN_COOKIE}=${value}` },
  });
}

describe("repository admin sessions", () => {
  it("issues a signed cookie that authenticates until rotated", async () => {
    process.env.REPOSITORY_ADMIN_SESSION_TOKEN = "test-secret-token-value-32bytes-ok";
    const token = await issueRepositoryAdminSession();
    expect(token).toBeTruthy();
    expect(await isRepositoryAdminAuthed(requestWithCookie(token!))).toBe(true);
    expect(await isRepositoryAdminAuthed(requestWithCookie("v1.9999999999.abc.not-a-sig"))).toBe(false);
  });

  it("rejects a static leftover token and revokes when the secret rotates", async () => {
    process.env.REPOSITORY_ADMIN_SESSION_TOKEN = "secret-a-must-be-32-bytes-long!!";
    const token = (await issueRepositoryAdminSession())!;
    expect(await isRepositoryAdminAuthed(requestWithCookie(token))).toBe(true);
    process.env.REPOSITORY_ADMIN_SESSION_TOKEN = "secret-b-must-be-32-bytes-long!!";
    expect(await isRepositoryAdminAuthed(requestWithCookie(token))).toBe(false);
    expect(await isRepositoryAdminAuthed(requestWithCookie("secret-a"))).toBe(false);
  });

  it("compares credentials without accepting a mismatch", async () => {
    process.env.REPOSITORY_ADMIN_USERNAME = "admin";
    process.env.REPOSITORY_ADMIN_PASSWORD = "correct-horse";
    expect(await validateRepositoryAdminCredentials("admin", "correct-horse")).toBe(true);
    expect(await validateRepositoryAdminCredentials("admin", "wrong")).toBe(false);
    expect(await validateRepositoryAdminCredentials("nope", "correct-horse")).toBe(false);
  });

  it("refuses to sign if the HMAC secret is the password or too short", async () => {
    process.env.REPOSITORY_ADMIN_PASSWORD = "same-value-used-as-hmac-secret!!";
    process.env.REPOSITORY_ADMIN_SESSION_TOKEN = "same-value-used-as-hmac-secret!!";
    expect(await issueRepositoryAdminSession()).toBeNull();
    process.env.REPOSITORY_ADMIN_SESSION_TOKEN = "short";
    expect(await issueRepositoryAdminSession()).toBeNull();
  });
});
