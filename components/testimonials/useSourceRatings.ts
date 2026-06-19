"use client";

import { useEffect, useState } from "react";
import { EMPTY_RATINGS, type SourceRatings } from "@/lib/testimonials/ratings";

export function useSourceRatings(): SourceRatings {
  const [ratings, setRatings] = useState<SourceRatings>(EMPTY_RATINGS);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/testimonials/ratings");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as SourceRatings;
        if (!cancelled) setRatings(data);
      } catch {
        /* keep empty */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return ratings;
}
