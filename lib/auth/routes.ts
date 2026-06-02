/** Routes that require sign-in (soft launch — articles & home stay public). */
export const PROTECTED_PREFIXES = [
  "/courses",
  "/quizzes",
  "/comics",
  "/dashboard",
  "/api/course-centre",
  "/api/quiz-centre",
];

/** Always reachable without a session. */
export const AUTH_PREFIXES = ["/login", "/signup", "/auth/callback"];

export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function isAuthPath(pathname: string): boolean {
  return AUTH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/** Only allow same-origin relative redirects after login. */
export function safeNextPath(value: string | null | undefined, fallback = "/dashboard"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
