declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/** Fire GA4 events only after analytics cookies are accepted (gtag loaded). */
export function trackGaEvent(event: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", event, params);
}

export function trackSignUp(method: "email" | "google") {
  trackGaEvent("sign_up", { method });
}