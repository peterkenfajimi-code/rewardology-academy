"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FEEDS, NEWS_TAB_KEYS } from "@/lib/news/feedConfig";
import type { NewsItem } from "@/lib/news/feedConfig";

const TABS = NEWS_TAB_KEYS.map((key) => ({
  key,
  label: FEEDS[key].label,
  dot: FEEDS[key].color,
}));

function stripHtml(html: string) {
  if (typeof document === "undefined") return html;
  const d = document.createElement("div");
  d.innerHTML = html || "";
  return d.textContent || d.innerText || "";
}
function truncate(str: string, n: number) {
  const s = stripHtml(str);
  return s.length > n ? s.slice(0, n).trim() + "…" : s;
}
function formatDate(dateStr: string) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  } catch {
    return "";
  }
}

type TabFeedResult = { items: NewsItem[]; warnings: string[] };

async function fetchTabFromApi(tabKey: string): Promise<TabFeedResult> {
  const res = await fetch(`/api/news-feed/${encodeURIComponent(tabKey)}`, {
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json()) as {
    status?: string;
    message?: string;
    items?: NewsItem[];
    warnings?: string[];
  };
  if (!res.ok || data.status !== "ok" || !data.items?.length) {
    throw new Error(data.message || "No articles loaded");
  }
  return { items: data.items, warnings: data.warnings ?? [] };
}

export function HomeNews() {
  const [activeTab, setActiveTab] = useState("total-rewards");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "partial" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [feedWarnings, setFeedWarnings] = useState<string[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [spinning, setSpinning] = useState(false);
  const cache = useRef<Record<string, { items: NewsItem[]; warnings: string[]; fetchedAt: number }>>({});

  const loadTab = useCallback(async (tabKey: string, force: boolean) => {
    const cached = cache.current[tabKey];
    const cacheAge = cached ? Date.now() - cached.fetchedAt : Infinity;
    if (cached && cacheAge < 300000 && !force) {
      setItems(cached.items);
      setFeedWarnings(cached.warnings);
      setStatus(cached.warnings.length ? "partial" : "ok");
      return;
    }
    setStatus("loading");
    setFeedWarnings([]);
    try {
      const { items, warnings } = await fetchTabFromApi(tabKey);
      cache.current[tabKey] = { items, warnings, fetchedAt: Date.now() };
      setItems(items);
      setFeedWarnings(warnings);
      setStatus(warnings.length ? "partial" : "ok");
      setUpdatedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setErrorMsg((e as Error).message || "unknown");
      setFeedWarnings([]);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadTab("total-rewards", false);
  }, [loadTab]);

  const switchTab = (key: string) => {
    setActiveTab(key);
    loadTab(key, false);
  };
  const refresh = () => {
    setSpinning(true);
    delete cache.current[activeTab];
    loadTab(activeTab, true).finally(() => setSpinning(false));
  };

  const config = FEEDS[activeTab];

  return (
    <section className="section news-section">
      <div className="section-inner">
        <div className="section-hd reveal">
          <div>
            <div className="section-eyebrow">Live Industry News</div>
            <h2 className="section-title">
              Stay Ahead of the <em>Field</em>
            </h2>
            <p className="section-sub">
              Real-time news from the world&apos;s leading HR and compensation sources — filtered for
              Total Rewards professionals.
            </p>
          </div>
          <div className="news-refresh">
            <span className="news-updated">
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background:
                    status === "error" ? "#F87171" : status === "partial" ? "#FBBF24" : "#4ADE80",
                  display: "inline-block",
                  marginRight: 6,
                }}
              />
              {status === "loading"
                ? "Loading feeds…"
                : status === "error"
                ? "Could not load feeds"
                : status === "partial"
                ? updatedAt
                  ? `Partial update ${updatedAt}`
                  : "Some feeds unavailable"
                : updatedAt
                ? `Updated ${updatedAt}`
                : "Live"}
            </span>
            <button
              className={`refresh-btn${spinning ? " spinning" : ""}`}
              type="button"
              onClick={refresh}
              disabled={spinning}
            >
              <span className="refresh-icon">↻</span> Refresh
            </button>
          </div>
        </div>

        <div className="news-tabs reveal">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`news-tab${activeTab === t.key ? " active" : ""}`}
              onClick={() => switchTab(t.key)}
            >
              <span className="tab-dot" style={{ background: t.dot }} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="news-layout">
          <div>
            {status === "loading" && (
              <div className="news-skeleton">
                {[80, 90, 88, 82, 79].map((w, i) => (
                  <div className="skel-card" key={i}>
                    <div className="skel-line" style={{ width: 80, height: 10 }} />
                    <div className="skel-line" style={{ width: `${w}%`, height: 18, marginTop: 10 }} />
                    <div className="skel-line" style={{ width: "65%", height: 13 }} />
                    <div className="skel-line" style={{ width: "48%", height: 10, marginTop: 8 }} />
                  </div>
                ))}
              </div>
            )}

            {status === "error" && (
              <div className="news-feed">
                <div className="news-error">
                  <div className="news-error-icon">⚠️</div>
                  <div className="news-error-title">Feeds temporarily unavailable</div>
                  <div className="news-error-desc">
                    {errorMsg}
                    <br />
                    Try refreshing in a moment. If this persists, some sources may be blocking requests.
                  </div>
                </div>
              </div>
            )}

            {(status === "ok" || status === "partial") && (
              <div className="news-feed">
                {status === "partial" && feedWarnings.length > 0 && (
                  <div className="news-warning" role="status">
                    <div className="news-warning-title">Some sources could not be loaded</div>
                    <div className="news-warning-desc">{feedWarnings.join(" · ")}</div>
                  </div>
                )}
                {items.map((item, i) => (
                  <a
                    key={item.link + i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="news-card"
                    style={{ ["--tab-color" as string]: config.color }}
                  >
                    <div>
                      <div className="nc-source">{item.source}</div>
                      <div className="nc-title">{item.title}</div>
                      <div className="nc-desc">{truncate(item.description, 120)}</div>
                      <div className="nc-meta">
                        <span className="nc-date">{formatDate(item.pubDate)}</span>
                        <span
                          className="nc-badge"
                          style={{ background: `${config.color}22`, color: config.color }}
                        >
                          {item.tag}
                        </span>
                      </div>
                    </div>
                    <div className="nc-arrow">→</div>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="news-sidebar">
            <div className="news-sidebar-card">
              <div className="nsc-title">🔥 Trending Topics</div>
              <div className="trending-list">
                {[
                  ["01", "Pay Transparency Laws 2026", "42 articles this week"],
                  ["02", "Skills-Based Pay Models", "31 articles this week"],
                  ["03", "AI in Compensation Planning", "28 articles this week"],
                  ["04", "Global Pay Equity Audits", "19 articles this week"],
                  ["05", "Mental Health Benefits ROI", "17 articles this week"],
                ].map(([rank, topic, count]) => (
                  <div className="trending-item" key={rank}>
                    <div className="ti-rank">{rank}</div>
                    <div>
                      <div className="ti-topic">{topic}</div>
                      <div className="ti-count">{count}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="news-sidebar-card">
              <div className="nsc-title">📡 Live Sources</div>
              <div className="news-sources-list">
                {config.liveSources.map(({ href, name, tag }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="ns-item" key={name}>
                    <span className="ns-dot" style={{ background: config.color }} />
                    <span className="ns-name">{name}</span>
                    <span className="ns-tag">{tag}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
