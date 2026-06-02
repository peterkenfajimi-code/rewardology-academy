import Image from "next/image";
import Link from "next/link";
import type { ComicIssue } from "@/lib/comics/comicData";
import { getAdjacentIssues } from "@/lib/comics/comicData";
import { ComicSeriesFooter } from "./ComicSeriesFooter";

type Props = {
  issue: ComicIssue;
};

export function ComicIssueView({ issue }: Props) {
  const { prev, next } = getAdjacentIssues(issue.slug);

  return (
    <div className="comics-root">
      <article className="cm-issue">
        <nav className="cm-issue-nav">
          <Link href="/comics" className="cm-back">
            ← Back to Series
          </Link>
          <div className="cm-issue-pager">
            {prev?.available ? (
              <Link href={`/comics/${prev.slug}`} className="cm-pager-btn">
                ← Issue #{prev.number}
              </Link>
            ) : (
              <span className="cm-pager-btn disabled">← Previous</span>
            )}
            {next ? (
              <Link
                href={next.available ? `/comics/${next.slug}` : "/comics"}
                className="cm-pager-btn"
              >
                {next.available ? `Issue #${next.number} →` : "All Issues →"}
              </Link>
            ) : (
              <Link href="/comics" className="cm-pager-btn">
                All Issues →
              </Link>
            )}
          </div>
        </nav>

        <header className="cm-issue-hd">
          <div className="cm-issue-num">Issue #{issue.number}</div>
          <h1 className="cm-issue-title">{issue.title}</h1>
          <p className="cm-issue-tagline">{issue.tagline}</p>
        </header>

        <div className="cm-comic-frame">
          {issue.available && issue.image ? (
            <Image
              src={issue.image}
              alt={`${issue.title} — full comic issue`}
              width={928}
              height={1200}
              priority
              sizes="(max-width: 960px) 100vw, 928px"
            />
          ) : (
            <div className="cm-coming-soon">
              <h3>Coming Soon</h3>
              <p>
                Issue #{issue.number}: {issue.title} is on its way. Check back soon or explore
                other issues in the series.
              </p>
              <Link href="/comics" className="cm-read-btn">
                View All Issues
              </Link>
            </div>
          )}
        </div>
      </article>

      <ComicSeriesFooter />
    </div>
  );
}
