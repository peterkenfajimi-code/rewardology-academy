"use client";

import Image from "next/image";
import Link from "next/link";
import { COMIC_ISSUES, COMIC_SERIES } from "@/lib/comics/comicData";

const GRID_ISSUES = COMIC_ISSUES.filter((i) => i.number !== 1);

export function HomeCartoons() {
  const featured = COMIC_ISSUES[0];

  return (
    <section className="section cartoons-section">
      <div className="section-inner">
        <div className="section-hd reveal">
          <div>
            <div className="section-eyebrow">Visual Storytelling</div>
            <h2 className="section-title">
              The Total Rewards <em>Effect</em>
            </h2>
            <p className="section-sub">
              Stories, workplaces, real impact. Explore total rewards through our
              illustrated comic series — sharp, memorable, and genuinely fun to read.
            </p>
          </div>
          <Link href="/comics" className="section-link">
            View all issues →
          </Link>
        </div>

        <div className="cartoon-hero reveal">
          <Link href={`/comics/${featured.slug}`} className="cartoon-hero-frame">
            <Image
              src={featured.image ?? COMIC_SERIES.coverImage}
              alt={`Issue #1: ${featured.title}`}
              width={640}
              height={480}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
            <div className="cartoon-play">
              <div className="play-circle">▶</div>
            </div>
            <div className="cartoon-episode-badge">Issue #1</div>
            <div className="cartoon-new-badge">New</div>
          </Link>

          <div className="cartoon-hero-info">
            <div className="ch-series">{COMIC_SERIES.title} · Comic Series</div>
            <h3 className="ch-title">{featured.title}</h3>
            <p className="ch-desc">{featured.tagline}</p>
            <div className="ch-meta">
              <div className="ch-meta-item">🎨 Illustrated Series</div>
              <div className="ch-meta-item">📖 5 Issues</div>
              <div className="ch-meta-item">✨ New Monthly</div>
            </div>
            <div className="ch-tags">
              <span
                className="ch-tag"
                style={{
                  color: "#C8963E",
                  borderColor: "rgba(200,150,62,.3)",
                  background: "rgba(200,150,62,.08)",
                }}
              >
                Total Rewards
              </span>
              <span
                className="ch-tag"
                style={{
                  color: "#2E7D8C",
                  borderColor: "rgba(46,125,140,.3)",
                  background: "rgba(46,125,140,.08)",
                }}
              >
                Retention
              </span>
              <span
                className="ch-tag"
                style={{
                  color: "#3A7D44",
                  borderColor: "rgba(58,125,68,.3)",
                  background: "rgba(58,125,68,.08)",
                }}
              >
                Recognition
              </span>
            </div>
            <div className="ch-actions">
              <Link href={`/comics/${featured.slug}`} className="btn-cartoon">
                ▶&nbsp; Read Issue #1
              </Link>
              <Link href="/comics" className="btn-cartoon-ghost">
                All Issues →
              </Link>
            </div>
          </div>
        </div>

        <div className="cartoon-grid-label reveal">More Issues</div>
        <div className="cartoons-grid">
          {GRID_ISSUES.map((issue, i) => (
            <Link
              key={issue.slug}
              href={issue.available ? `/comics/${issue.slug}` : "/comics"}
              className={`cartoon-card reveal reveal-d${i + 1}${issue.available ? "" : " cm-soon-card"}`}
            >
              <div className="cc-thumb">
                {issue.image ? (
                  <Image
                    src={issue.image}
                    alt={`Issue #${issue.number}: ${issue.title}`}
                    width={400}
                    height={280}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                  />
                ) : (
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${issue.accent}33, #07192e)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      padding: 20,
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          fontFamily: "var(--hserif)",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "white",
                          lineHeight: 1.2,
                        }}
                      >
                        {issue.title}
                      </div>
                    </div>
                  </div>
                )}
                <div className="cc-thumb-overlay">
                  <span className="cc-ep-num">Issue #{String(issue.number).padStart(2, "0")}</span>
                </div>
                {issue.available && (
                  <div className="cc-hover-play">
                    <div className="cc-play-sm">▶</div>
                  </div>
                )}
              </div>
              <div className="cartoon-card-body">
                <div className="cc-topic" style={{ color: issue.accent }}>
                  {issue.available ? "Available Now" : "Coming Soon"}
                </div>
                <div className="cc-title-sm">{issue.title}</div>
                <div className="cc-desc-sm">{issue.description}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
