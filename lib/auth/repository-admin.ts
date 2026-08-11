import type { NextRequest } from "next/server";

export const REPOSITORY_ADMIN_COOKIE = "ra_repository_admin";

export function isRepositoryAdminAuthed(req: NextRequest): boolean {
  const expected = process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim();
  if (!expected) return false;
  const token = req.cookies.get(REPOSITORY_ADMIN_COOKIE)?.value;
  return token === expected;
}

export function validateRepositoryAdminCredentials(
  username: string,
  password: string
): boolean {
  const expectedUser = process.env.REPOSITORY_ADMIN_USERNAME?.trim();
  const expectedPass = process.env.REPOSITORY_ADMIN_PASSWORD?.trim();
  if (!expectedUser || !expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}

export function repositoryAdminSessionToken(): string | null {
  return process.env.REPOSITORY_ADMIN_SESSION_TOKEN?.trim() ?? null;
}
