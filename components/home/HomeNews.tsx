"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const RSS2JSON = "https://api.rss2json.com/v1/api.json?rss_url=";

type Source = { name: string; url: string; tag: string };
type FeedConfig = { color: string; label: string; sources: Source[] };
type NewsItem = {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  tag: string;
};

const FEEDS: Record<string, FeedConfig> = {
  "total-rewards": {
    color: "#C8963E",
    label: "Total Rewards",
    sources: [
      { name: "SHRM", url: "https://www.shrm.org/rss/pages/compensation.aspx", tag: "Compensation" },
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "HR News" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Total Rewards" },
    ],
  },
  compensation: {
    color: "#2E7D8C",
    label: "Compensation",
    sources: [
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Compensation" },
      { name: "Workforce", url: "https://www.workforce.com/feed", tag: "Pay" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Pay Strategy" },
    ],
  },
  benefits: {
    color: "#3A7D44",
    label: "Benefits",
    sources: [
      { name: "BenefitsPRO", url: "https://www.benefitspro.com/feed/", tag: "Benefits" },
      { name: "HR Dive", url: "https://www.hrdive.com/feeds/news/", tag: "Benefits" },
      { name: "HR Executive", url: "https://hrexecutive.com/feed/", tag: "Wellbeing" },
    ],
  },
};

const TABS = [
  { key: "total-rewards", label: "Total Rewards", dot: "#C8963E" },
  { key: "compensation", label: "Compensation", dot: "#2E7D8C" },
  { key: "benefits", label: "Benefits", dot: "#3A7D44" },
];

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

async function fetchFeed(source: Source): Promise<NewsItem[]> {
  const url = RSS2JSON + encodeURIComponent(source.url) + "&count=4";
  const r = await fetch(url, { signal: AbortSignal.timeout(7000) });
  const data = await r.json();
  if (data.status !== "ok") throw new Error("Feed error");
  return (data.items || []).slice(0, 4).map((item: Record<string, string>) => ({
    title: item.title || "",
    description: item.description || item.content || "",
    link: item.link || "#",
    pubDate: item.pubDate || "",
    source: source.name,
    tag: source.tag,
  }));
}

export function HomeNews() {
  const [activeTab, setActiveTab] = useState("total-rewards");
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [updatedAt, setUpdatedAt] = useState("");
  const [spinning, setSpinning] = useState(false);
  const cache = useRef<Record<string, { items: NewsItem[]; fetchedAt: number }>>({});

  const loadTab = useCallback(async (tabKey: string, force: boolean) => {
    const config = FEEDS[tabKey];
    const cached = cache.current[tabKey];
    const cacheAge = cached ? Date.now() - cached.fetchedAt : Infinity;
    if (cached && cacheAge < 300000 && !force) {
      setItems(cached.items);
      setStatus("ok");
      return;
    }
    setStatus("loading");
    try {
      const results = await Promise.allSettled(config.sources.map((s) => fetchFeed(s)));
      const collected: NewsItem[] = [];
      results.forEach((r) => {
        if (r.status === "fulfilled") collected.push(...r.value);
      });
      const seen = new Set<string>();
      const unique = collected
        .filter((i) => {
          if (seen.has(i.title)) return false;
          seen.add(i.title);
          return true;
        })
        .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
        .slice(0, 8);
      if (!unique.length) throw new Error("No articles loaded");
      cache.current[tabKey] = { items: unique, fetchedAt: Date.now() };
      setItems(unique);
      setStatus("ok");
      setUpdatedAt(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setErrorMsg((e as Error).message || "unknown");
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
                  background: status === "error" ? "#F87171" : "#4ADE80",
                  display: "inline-block",
                  marginRight: 6,
                }}
              />
              {status === "loading"
                ? "Loading feeds…"
                : status === "error"
                ? "Could not load feeds"
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
                    Network error: {errorMsg}
                    <br />
                    Live RSS requires an internet connection. Check your network or try refreshing.
                  </div>
                </div>
              </div>
            )}

            {status === "ok" && (
              <div className="news-feed">
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
                  <a href="#" className="trending-item" key={rank}>
                    <div className="ti-rank">{rank}</div>
                    <div>
                      <div className="ti-topic">{topic}</div>
                      <div className="ti-count">{count}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="news-sidebar-card">
              <div className="nsc-title">📡 Live Sources</div>
              <div className="news-sources-list">
                {[
                  ["https://www.shrm.org", "#C8963E", "SHRM", "HR & Comp"],
                  ["https://www.hrdive.com", "#2E7D8C", "HR Dive", "News"],
                  ["https://www.benefitspro.com", "#3A7D44", "BenefitsPRO", "Benefits"],
                  ["https://hrexecutive.com", "#6B4C9A", "HR Executive", "Strategy"],
                  ["https://www.workforce.com", "#B84B4B", "Workforce", "Analytics"],
                ].map(([href, dot, name, tag]) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="ns-item" key={name}>
                    <span className="ns-dot" style={{ background: dot }} />
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
