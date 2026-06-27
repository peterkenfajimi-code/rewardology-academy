"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { levelFor } from "@/lib/xp/levels";
import { readLocalTotalXp } from "@/lib/xp/localTotalXp";
import { MAX_PLATFORM_XP } from "@/lib/xp/platformMax";

async function fetchServerXp(): Promise<number | null> {
  try {
    const r = await fetch("/api/xp/total");
    const data = (await r.json()) as { authenticated: boolean; total: number };
    return data.authenticated ? data.total : null;
  } catch {
    return null;
  }
}

export function HubXpBanner() {
  const [totalXp, setTotalXp] = useState(0);
  // Track whether we've received a valid server value; if so, never overwrite it
  // with a stale localStorage read — only refresh via a new server fetch.
  const serverLoaded = useRef(false);

  useEffect(() => {
    // Show local cache instantly to avoid a blank flash
    setTotalXp(readLocalTotalXp());

    // Fetch authoritative server total
    fetchServerXp().then((serverXp) => {
      if (serverXp !== null) {
        setTotalXp(serverXp);
        serverLoaded.current = true;
      }
    });

    // When new XP is awarded in this tab, re-fetch from server for accuracy
    function onXpUpdated() {
      if (serverLoaded.current) {
        fetchServerXp().then((serverXp) => {
          if (serverXp !== null) setTotalXp(serverXp);
        });
      } else {
        setTotalXp(readLocalTotalXp());
      }
    }

    // Re-fetch from server when user returns to the tab or another tab changes storage
    function onFocusOrStorage() {
      fetchServerXp().then((serverXp) => {
        if (serverXp !== null) {
          setTotalXp(serverXp);
          serverLoaded.current = true;
        } else if (!serverLoaded.current) {
          setTotalXp(readLocalTotalXp());
        }
      });
    }

    window.addEventListener("ra-xp-updated", onXpUpdated);
    window.addEventListener("focus", onFocusOrStorage);
    window.addEventListener("storage", onFocusOrStorage);
    return () => {
      window.removeEventListener("ra-xp-updated", onXpUpdated);
      window.removeEventListener("focus", onFocusOrStorage);
      window.removeEventListener("storage", onFocusOrStorage);
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
