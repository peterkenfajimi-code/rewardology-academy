"use client";

import { useEffect, useState } from "react";
import type { IssueCertificatePayload, IssuedCertificateResponse } from "@/lib/certificates/types";

export function useIssuedCertificate(
  payload: IssueCertificatePayload | null,
  enabled: boolean
) {
  const [issued, setIssued] = useState<IssuedCertificateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled || !payload) {
      setIssued(null);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await fetch("/api/certificates/issue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = (await res.json()) as IssuedCertificateResponse & { error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Could not issue certificate");
          setIssued(null);
          return;
        }
        setIssued({ id: data.id, verifyUrl: data.verifyUrl });
      } catch {
        if (!cancelled) setError("Network error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    payload?.certType,
    payload?.sourceId,
    payload?.recipientName,
    payload?.credentialName,
    payload?.credentialDetail,
    payload?.scorePct,
    payload?.xpEarned,
  ]);

  return { issued, loading, error };
}
