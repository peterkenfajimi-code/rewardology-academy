"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { GEO_RECORD_SESSION_KEY, recordUserLocation } from "@/lib/geo/clientRecordLocation";

/** Ping the server once per browser session to store approximate user location. */
export function GeoRecorder() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(GEO_RECORD_SESSION_KEY)) return;

    let cancelled = false;

    (async () => {
      try {
        const result = await recordUserLocation();
        if (!result.ok || cancelled) return;
      } catch {
        /* non-blocking */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  return null;
}
