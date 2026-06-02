import Link from "next/link";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
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
            <p>25 articles · 12 topics · select any to begin reading</p>
          </div>
          <Link href="/articles" className="ess-ix-back">
            ← Back to Cover
          </Link>
        </header>
      </section>
      <div className="ess-ix-grid">
        {ESSENTIALS_ARTICLES.map((a) => (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className="ess-idx-card"
            style={{ ["--article-color" as string]: a.color }}
          >
            <div className="ess-idx-n">{a.num}</div>
            <div className="ess-idx-cat" style={{ color: a.color }}>
              {a.category}
            </div>
            <div className="ess-idx-ti">{a.title}</div>
            <div className="ess-idx-arr">→</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
