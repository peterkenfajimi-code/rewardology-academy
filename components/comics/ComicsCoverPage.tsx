import Image from "next/image";
import Link from "next/link";
import { COMIC_ISSUES, COMIC_SERIES } from "@/lib/comics/comicData";

export function ComicsCoverPage() {
  return (
    <div className="comics-root">
      <section className="cm-cover-poster" aria-label={`${COMIC_SERIES.title} comic series`}>
        <Image
          src={COMIC_SERIES.coverImage}
          alt={`${COMIC_SERIES.title} — comic series cover with all five issues`}
          width={1400}
          height={1800}
          priority
          sizes="(max-width: 1400px) 100vw, 1400px"
          className="cm-cover-poster-img"
        />
        <nav className="cm-cover-links" aria-label="Read an issue">
          {COMIC_ISSUES.map((issue) =>
            issue.available ? (
              <Link
                key={issue.slug}
                href={`/comics/${issue.slug}`}
                className="cm-cover-issue-link"
              >
                Read Issue #{issue.number}
              </Link>
            ) : (
              <span key={issue.slug} className="cm-cover-issue-link cm-cover-issue-soon" />
            )
          )}
        </nav>
      </section>
    </div>
  );
}
