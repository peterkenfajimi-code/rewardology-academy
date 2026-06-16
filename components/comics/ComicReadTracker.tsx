"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COMIC_ISSUES } from "@/lib/comics/comicData";
import {
  COMICS_READ_STORAGE_KEY,
  earnComicIssueXp,
  mergeComicsFromServer,
  readComicsReadSet,
  syncComicIssueToAccount,
} from "@/lib/comics/progress";
import { COMIC_XP_PER_ISSUE } from "@/lib/comics/progress";

type Props = {
  slug: string;
  issueNumber: number;
  title: string;
  available: boolean;
};

export function ComicReadTracker({ slug, issueNumber, title, available }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [issuesRead, setIssuesRead] = useState(0);
  const [comicsXpTotal, setComicsXpTotal] = useState(0);
  const awardedRef = useRef(false);

  const availableIssues = COMIC_ISSUES.filter((i) => i.available);
  const maxComicsXp = availableIssues.length * COMIC_XP_PER_ISSUE;
  const issuesTotal = availableIssues.length;

  const applyProgress = useCallback(
    (serverSlugs: string[], authed: boolean) => {
      setAuthenticated(authed);
      const merged = new Set([...readComicsReadSet(), ...serverSlugs]);
      setIssuesRead(merged.size);
      setComicsXpTotal(merged.size * COMIC_XP_PER_ISSUE);
      const done = merged.has(slug);
      setCompleted(done);
      if (done) awardedRef.current = true;
    },
    [slug]
  );

  const awardRead = useCallback(async () => {
    if (awardedRef.current || !available || readComicsReadSet().has(slug)) {
      if (readComicsReadSet().has(slug)) {
        awardedRef.current = true;
        setCompleted(true);
      }
      return;
    }

    awardedRef.current = true;
    const earned = earnComicIssueXp(slug);
    if (earned > 0) setShowBanner(true);
    setCompleted(true);
    applyProgress([], authenticated);

    await syncComicIssueToAccount(slug, issueNumber);

    try {
      const res = await fetch("/api/comics/progress", { cache: "no-store" });
      const data = (await res.json()) as {
        authenticated?: boolean;
        slugs?: string[];
      };
      if (data.authenticated && data.slugs) {
        mergeComicsFromServer(data.slugs);
        applyProgress(data.slugs, true);
      }
    } catch {
      /* guest or offline */
    }
  }, [applyProgress, authenticated, available, issueNumber, slug]);

  useEffect(() => {
    if (!available) return;

    let cancelled = false;

    (async () => {
      const localSlugs = [...readComicsReadSet()];

      try {
        const res = await fetch("/api/comics/progress", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          slugs?: string[];
        };
        if (cancelled) return;

        if (data.authenticated && data.slugs) {
          mergeComicsFromServer(data.slugs);
          applyProgress(data.slugs, true);

          for (const missingSlug of localSlugs.filter((s) => !data.slugs!.includes(s))) {
            const issue = COMIC_ISSUES.find((i) => i.slug === missingSlug);
            if (issue?.available) {
              await fetch("/api/comics/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  slug: missingSlug,
                  issueNumber: issue.number,
                  xp: COMIC_XP_PER_ISSUE,
                }),
              });
            }
          }

          const refresh = await fetch("/api/comics/progress", { cache: "no-store" });
          const refreshed = (await refresh.json()) as { slugs?: string[] };
          if (refreshed.slugs) {
            mergeComicsFromServer(refreshed.slugs);
            applyProgress(refreshed.slugs, true);
          }
        } else {
          applyProgress([], false);
        }
      } catch {
        if (!cancelled) applyProgress([], false);
      }

      if (!cancelled && !readComicsReadSet().has(slug)) {
        await awardRead();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [applyProgress, available, awardRead, slug]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === COMICS_READ_STORAGE_KEY) {
        applyProgress([], authenticated);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyProgress, authenticated]);

  if (!available || (!showBanner && !completed)) return null;

  const justEarned = showBanner;

  return (
    <div className={`cm-xp-banner${justEarned ? " show" : " cm-xp-banner-done"}`}>
      <div className="cm-xp-banner-icon" aria-hidden>
        {justEarned ? "⚡" : "✓"}
      </div>
      <div>
        <div className="cm-xp-banner-title">
          {justEarned
            ? `+${COMIC_XP_PER_ISSUE} XP earned — Issue #${issueNumber} complete!`
            : `${title} · +${COMIC_XP_PER_ISSUE} XP`}
        </div>
        <div className="cm-xp-banner-sub">
          {issuesRead} of {issuesTotal} issues · {comicsXpTotal} / {maxComicsXp} XP total
          {!authenticated && " · sign in to sync to your dashboard"}
        </div>
      </div>
    </div>
  );
}
