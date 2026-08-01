"use client";

import Image from "next/image";
import Link from "next/link";
import { COMIC_ISSUES, COMIC_SERIES } from "@/lib/comics/comicData";

export function HomeCartoons() {
  const featured = COMIC_ISSUES[0];
  const availableCount = COMIC_ISSUES.filter((issue) => issue.available).length;

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
            Read the comic →
          </Link>
        </div>

        <div className="cartoon-hero reveal">
          <Link href={`/comics/${featured.slug}`} className="cartoon-hero-frame">
            <Image
              src={featured.coverImage}
              alt={`Issue #${featured.number}: ${featured.title}`}
              width={640}
              height={480}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
            />
            <div className="cartoon-play">
              <div className="play-circle">▶</div>
            </div>
            <div className="cartoon-episode-badge">Issue #{featured.number}</div>
            <div className="cartoon-new-badge">New</div>
          </Link>

          <div className="cartoon-hero-info">
            <div className="ch-series">{COMIC_SERIES.title} · Comic Series</div>
            <h3 className="ch-title">{featured.title}</h3>
            <p className="ch-desc">{featured.tagline}</p>
            <div className="ch-meta">
              <div className="ch-meta-item">🎨 Illustrated Series</div>
              <div className="ch-meta-item">
                📖 {availableCount} Issue{availableCount === 1 ? "" : "s"}
              </div>
              <div className="ch-meta-item">✨ More Coming</div>
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
                Workplace Stories
              </span>
              <span
                className="ch-tag"
                style={{
                  color: "#3A7D44",
                  borderColor: "rgba(58,125,68,.3)",
                  background: "rgba(58,125,68,.08)",
                }}
              >
                Culture
              </span>
            </div>
            <div className="ch-actions">
              <Link href={`/comics/${featured.slug}`} className="btn-cartoon">
                ▶&nbsp; Read Issue #{featured.number}
              </Link>
              <Link href="/comics" className="btn-cartoon-ghost">
                Comic Hub →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
