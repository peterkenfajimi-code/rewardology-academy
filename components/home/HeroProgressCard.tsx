"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTACT_EMAIL, DAILY_QUIZ_HREF } from "@/lib/site";
import { readLocalTotalXp } from "@/lib/xp/localTotalXp";
import { levelFor, XP_LEVELS } from "@/lib/xp/levels";

export function HeroProgressCard() {
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    function refresh() {
      setTotalXp(readLocalTotalXp());
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("ra-xp-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("ra-xp-updated", refresh);
    };
  }, []);

  const { next } = levelFor(totalXp);
  const goal = next?.min ?? XP_LEVELS[XP_LEVELS.length - 1].min;
  const pct = goal > 0 ? Math.min(100, Math.round((totalXp / goal) * 100)) : 0;

  return (
    <div className="hero-card">
      <div className="hero-card-top">
        <div className="challenge-eyebrow">
          <span className="challenge-dot" /> Today&apos;s Challenge
        </div>
        <div className="challenge-title">Compensation Basics Quiz</div>
        <div className="challenge-xp">⚡ Earn 15 XP daily</div>
      </div>
      <div className="hero-card-bottom">
        <div className="xp-bar-label">
          <span>Your XP Progress</span>
          <span>
            {totalXp} / {goal}
          </span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="mini-courses">
          <Link href="/courses?course=1" className="mini-course">
            <div className="mc-icon" style={{ background: "linear-gradient(135deg,#0C4A6E,#0891B2)" }}>
              📐
            </div>
            <div>
              <div className="mc-name">Compensation Fundamentals</div>
              <div className="mc-meta">Salary structures · Job evaluation</div>
            </div>
            <div className="mc-price">Free</div>
          </Link>
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=Advanced%20Total%20Rewards%20Course%20Waitlist`}
            className="mini-course mini-course-waitlist"
          >
            <div className="mc-icon" style={{ background: "linear-gradient(135deg,#7F1D1D,#DC2626)" }}>
              🏛️
            </div>
            <div>
              <div className="mc-name">Advanced Total Rewards</div>
              <div className="mc-meta">Join the waitlist · Coming soon</div>
            </div>
            <div className="mc-price waitlist">Waitlist</div>
          </a>
        </div>
        {totalXp === 0 && (
          <Link href={DAILY_QUIZ_HREF} className="hero-xp-hint">
            Start earning XP with today&apos;s quiz →
          </Link>
        )}
      </div>
    </div>
  );
}
