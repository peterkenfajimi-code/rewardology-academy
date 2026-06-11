"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ARTICLE_READ_STORAGE_KEY,
  dispatchXpUpdated,
  readLocalArticleIds,
  type ArticleProgressMap,
  writeLocalArticleId,
} from "@/lib/articles/progress";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";

const READ_THRESHOLD = 78;

export function useArticleRead(articleId: number) {
  const [authenticated, setAuthenticated] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [articlesRead, setArticlesRead] = useState(0);
  const [articleXpTotal, setArticleXpTotal] = useState(0);
  const awardedRef = useRef(false);

  const maxArticleXp = ESSENTIALS_ARTICLES.reduce((s, a) => s + a.xp, 0);

  const applyProgress = useCallback(
    (map: ArticleProgressMap, localIds: number[], authed: boolean) => {
      setAuthenticated(authed);
      const readCount = Math.max(Object.keys(map).length, localIds.length);
      const xpSum =
        Object.keys(map).length > 0
          ? Object.values(map).reduce((s, r) => s + r.xp, 0)
          : localIds.reduce(
              (s, id) => s + (ESSENTIALS_ARTICLES.find((a) => a.id === id)?.xp ?? 0),
              0
            );
      setArticlesRead(readCount);
      setArticleXpTotal(xpSum);
      const done = Boolean(map[articleId]) || localIds.includes(articleId);
      setCompleted(done);
      if (done) awardedRef.current = true;
    },
    [articleId]
  );

  const awardRead = useCallback(async () => {
    if (awardedRef.current) return;
    awardedRef.current = true;
    writeLocalArticleId(articleId);
    setCompleted(true);
    setShowBanner(true);

    try {
      const res = await fetch("/api/articles/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId }),
      });
      const data = (await res.json()) as {
        authenticated?: boolean;
        completed?: ArticleProgressMap;
      };
      if (res.ok && data.completed) {
        applyProgress(data.completed, readLocalArticleIds(), Boolean(data.authenticated));
      } else {
        applyProgress({}, readLocalArticleIds(), false);
      }
    } catch {
      applyProgress({}, readLocalArticleIds(), false);
    }

    dispatchXpUpdated();
  }, [applyProgress, articleId]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const localIds = readLocalArticleIds();
      try {
        const res = await fetch("/api/articles/progress", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          completed?: ArticleProgressMap;
        };
        if (cancelled) return;
        if (data.authenticated && data.completed) {
          applyProgress(data.completed, localIds, true);
          const missing = localIds.filter((id) => !data.completed![id]);
          for (const id of missing) {
            await fetch("/api/articles/progress", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ articleId: id }),
            });
          }
          if (missing.length) {
            const refresh = await fetch("/api/articles/progress", { cache: "no-store" });
            const refreshed = (await refresh.json()) as {
              authenticated?: boolean;
              completed?: ArticleProgressMap;
            };
            if (refreshed.completed) {
              applyProgress(refreshed.completed, readLocalArticleIds(), Boolean(refreshed.authenticated));
            }
          }
          return;
        }
      } catch {
        /* guest */
      }
      if (!cancelled) applyProgress({}, localIds, false);
    })();

    return () => {
      cancelled = true;
    };
  }, [applyProgress, articleId]);

  useEffect(() => {
    function onScroll() {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      setProgressWidth(Math.min(100, pct));
      if (pct >= READ_THRESHOLD && !awardedRef.current) {
        void awardRead();
      }
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [awardRead]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ARTICLE_READ_STORAGE_KEY) {
        applyProgress({}, readLocalArticleIds(), authenticated);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [applyProgress, authenticated]);

  return {
    authenticated,
    completed,
    showBanner,
    progressWidth,
    articlesRead,
    articleXpTotal,
    maxArticleXp,
    articlesTotal: ESSENTIALS_ARTICLES.length,
  };
}

export function ArticleReadingProgress({ width }: { width: number }) {
  return (
    <div className="ess-prog">
      <div className="ess-prog-fill" style={{ width: `${width}%` }} />
    </div>
  );
}

export function ArticleXpBanner({
  xp,
  color,
  showBanner,
  completed,
  authenticated,
  articlesRead,
  articleXpTotal,
  maxArticleXp,
  articlesTotal,
}: {
  xp: number;
  color: string;
  showBanner: boolean;
  completed: boolean;
  authenticated: boolean;
  articlesRead: number;
  articleXpTotal: number;
  maxArticleXp: number;
  articlesTotal: number;
}) {
  if (!showBanner && !completed) return null;

  const justEarned = showBanner;
  return (
    <div className={`ess-xp-banner show${justEarned ? "" : " ess-xp-banner-done"}`}>
      <div className="ess-xp-banner-icon" aria-hidden>
        {justEarned ? "⚡" : "✓"}
      </div>
      <div>
        <div className="ess-xp-banner-title" style={justEarned ? undefined : { color }}>
          {justEarned ? `+${xp} XP earned — article complete!` : `Article completed · +${xp} XP`}
        </div>
        <div className="ess-xp-banner-sub">
          {articlesRead} of {articlesTotal} articles · {articleXpTotal} / {maxArticleXp} XP total
          {!authenticated && " · sign in to sync to your dashboard"}
        </div>
      </div>
    </div>
  );
}
