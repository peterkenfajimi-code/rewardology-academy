/** Browsers POST CSP reports here (legacy report-uri and Reporting API). */
export const CSP_REPORT_PATH = "/api/security/csp-report";

/**
 * Report-only CSP: observe violations before enforcing.
 * Sanity is a read-only CDN/API client here (no Studio, visual editing, or
 * preview iframe), so frame-ancestors 'none' plus X-Frame-Options DENY is safe.
 * If a Sanity presentation tool later embeds this origin, drop X-Frame-Options
 * and set frame-ancestors to that Studio origin instead of 'none'.
 */
export const CONTENT_SECURITY_POLICY_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.supabase.co https://img.logo.dev https://*.netlify.app",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.sanity.io https://cdn.sanity.io https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
  `report-uri ${CSP_REPORT_PATH}`,
  "report-to csp-endpoint",
].join("; ");

export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Reporting-Endpoints",
    value: `csp-endpoint="${CSP_REPORT_PATH}"`,
  },
  { key: "Content-Security-Policy-Report-Only", value: CONTENT_SECURITY_POLICY_REPORT_ONLY },
];
