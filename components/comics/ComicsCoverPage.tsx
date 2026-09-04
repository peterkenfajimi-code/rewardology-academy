import Image from "next/image";
import Link from "next/link";
import { COMIC_ISSUES, COMIC_SERIES } from "@/lib/comics/comicData";

export function ComicsCoverPage() {
  const availableIssues = COMIC_ISSUES.filter((issue) => issue.available);

  return (
    <div className="comics-root">
      <section className="cm-series-hub" aria-label={`${COMIC_SERIES.title} comic series`}>
        <div className="cm-series-hero">
          <Image
            src={COMIC_SERIES.coverImage}
            alt={`${COMIC_SERIES.title} — Issue 1 cover`}
            width={800}
            height={1200}
            priority
            sizes="(max-width: 840px) 100vw, 800px"
            className="cm-series-cover-img"
          />
          <div className="cm-series-hero-copy">
            <p className="cm-series-eyebrow">{COMIC_SERIES.eyebrow}</p>
            <h1 className="cm-series-title">{COMIC_SERIES.title}</h1>
            <p className="cm-series-tagline">{COMIC_SERIES.tagline}</p>
            <div className="cm-series-actions">
              {availableIssues.map((issue) => (
                <Link key={issue.slug} href={`/comics/${issue.slug}`} className="cm-read-btn">
                  Read Issue #{issue.number}: {issue.title}
                </Link>
              ))}
            </div>
            <p className="cm-series-soon">{COMIC_SERIES.nextTeaser}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
