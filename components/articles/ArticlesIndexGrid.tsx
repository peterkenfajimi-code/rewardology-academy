"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { readLocalArticleIds } from "@/lib/articles/progress";

export function ArticlesIndexGrid() {
  const [readIds, setReadIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      const local = new Set(readLocalArticleIds());
      try {
        const res = await fetch("/api/articles/progress", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          completed?: Record<number, unknown>;
        };
        if (data.authenticated && data.completed) {
          for (const id of Object.keys(data.completed)) {
            local.add(Number(id));
          }
        }
      } catch {
        /* guest */
      }
      setReadIds(local);
    }

    load();
    function refresh() {
      setReadIds(new Set(readLocalArticleIds()));
    }
    window.addEventListener("ra-xp-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("ra-xp-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return (
    <div className="ess-ix-grid">
      {ESSENTIALS_ARTICLES.map((a) => {
        const read = readIds.has(a.id);
        return (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className={`ess-idx-card${read ? " ess-idx-read" : ""}`}
            style={{ ["--article-color" as string]: a.color }}
          >
            <div className="ess-idx-n">{a.num}</div>
            <div className="ess-idx-cat" style={{ color: a.color }}>
              {a.category}
            </div>
            <div className="ess-idx-ti">{a.title}</div>
            {a.description && <div className="ess-idx-desc">{a.description}</div>}
            <div className="ess-idx-meta">
              <span>⏱ {a.readTime}</span>
              <span style={{ color: a.color }}>
                {read ? "✓ Read · " : ""}⚡ {a.xp} XP
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
