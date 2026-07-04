"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const SESSION_KEY = "ra_geo_recorded";

/** Ping the server once per browser session to store approximate user location. */
export function GeoRecorder() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(SESSION_KEY)) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/geo/record", { method: "POST" });
        if (!res.ok || cancelled) return;
        sessionStorage.setItem(SESSION_KEY, "1");
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
