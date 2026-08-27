import Link from "next/link";
import { ArticlesIndexGrid } from "@/components/articles/ArticlesIndexGrid";
import { ESSENTIALS_ARTICLES, ESSENTIALS_TOPICS } from "@/lib/articles/essentials";
import { essentialsSerif, essentialsSans } from "@/lib/articles/utils";
import "@/styles/essentials.css";

export default function ArticlesIndexPage() {
  return (
    <div className={`essentials-root ${essentialsSerif.variable} ${essentialsSans.variable}`}>
      <section className="ess-ix-hero">
        <div className="ess-ix-mesh" />
        <header className="ess-ix-hd">
          <div>
            <h2>
              All <em style={{ fontStyle: "italic", color: "var(--gold)" }}>Articles</em>
            </h2>
            <p>
              {ESSENTIALS_ARTICLES.length} articles · {ESSENTIALS_TOPICS.length} topics · select any
              to begin reading
            </p>
          </div>
          <Link href="/articles" className="ess-ix-back">
            ← Back to Cover
          </Link>
        </header>
      </section>
      <ArticlesIndexGrid />
    </div>
  );
}
