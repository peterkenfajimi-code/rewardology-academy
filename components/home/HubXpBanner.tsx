"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { levelFor } from "@/lib/xp/levels";
import { readLocalTotalXp } from "@/lib/xp/localTotalXp";
import { MAX_PLATFORM_XP } from "@/lib/xp/platformMax";

export function HubXpBanner() {
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    // Show localStorage value immediately, then replace with authoritative server total.
    setTotalXp(readLocalTotalXp());

    fetch("/api/xp/total")
      .then((r) => r.json())
      .then((data: { authenticated: boolean; total: number }) => {
        if (data.authenticated) {
          setTotalXp(data.total);
        }
      })
      .catch(() => {
        // Silent fallback: keep the localStorage value already shown.
      });

    function refresh() {
      setTotalXp(readLocalTotalXp());
    }
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("ra-xp-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ra-xp-updated", refresh);
    };
  }, []);

  const pct = MAX_PLATFORM_XP > 0 ? Math.min(100, Math.round((totalXp / MAX_PLATFORM_XP) * 100)) : 0;
  const { current, next } = levelFor(totalXp);

  return (
    <section className="hub-xp-banner">
      <div className="hub-xp-inner">
        <div>
          <div className="hub-xp-label">Your Progress</div>
          <h2 className="hub-xp-title">
            Track your learning <em>across every platform module</em>
          </h2>
          <div className="hub-xp-bar-wrap">
            <div className="hub-xp-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="hub-xp-nums">
            <span>
              {totalXp.toLocaleString()} XP earned · {pct}% of platform · {current.name}
              {next ? ` · ${(next.min - totalXp).toLocaleString()} XP to ${next.name}` : ""}
            </span>
            <span className="hub-xp-max-label">
              of {MAX_PLATFORM_XP.toLocaleString()} XP max
            </span>
          </div>
          <Link href="/dashboard" className="hub-xp-link">
            Open dashboard →
          </Link>
        </div>
        <div className="hub-xp-right">
          <div className="hub-xp-big">
            {totalXp.toLocaleString()}
            <span>XP</span>
          </div>
          <div className="hub-xp-sub">earned so far</div>
        </div>
      </div>
    </section>
  );
}
