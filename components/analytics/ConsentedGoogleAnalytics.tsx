"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "ra_cookie_analytics";

export function ConsentedGoogleAnalytics({ gaId }: { gaId: string }) {
  const [consent, setConsent] = useState<"unknown" | "granted" | "denied">("unknown");

  useEffect(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "1") setConsent("granted");
      else if (v === "0") setConsent("denied");
    } catch {
      setConsent("denied");
    }
  }, []);

  const accept = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setConsent("granted");
  }, []);

  const decline = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, "0");
    } catch {
      /* ignore */
    }
    setConsent("denied");
  }, []);

  return (
    <>
      {consent === "granted" ? <GoogleAnalytics gaId={gaId} /> : null}
      {consent === "unknown" ? (
        <div className="ra-cookie-banner" role="dialog" aria-label="Cookie preferences">
          <p className="ra-cookie-banner-text">
            We use cookies for analytics (Google Analytics) to understand traffic and improve the
            site. You can accept or decline non-essential analytics cookies.
          </p>
          <div className="ra-cookie-banner-actions">
            <button type="button" className="ra-cookie-btn ra-cookie-btn-primary" onClick={accept}>
              Accept analytics
            </button>
            <button type="button" className="ra-cookie-btn" onClick={decline}>
              Decline
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}