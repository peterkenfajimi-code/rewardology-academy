import Link from "next/link";
import { essentialsSerif, essentialsSans } from "@/lib/articles/utils";
import "@/styles/essentials.css";

export default function ArticlesCoverPage() {
  return (
    <div
      className={`essentials-root ${essentialsSerif.variable} ${essentialsSans.variable}`}
    >
      <section className="ess-cover">
        <div className="ess-cover-glow" />
        <div className="ess-cover-grid" />
        <div className="ess-cover-in">
          <div className="ess-eyebrow">Rewardology Academy</div>
          <h1 className="ess-cover-title">
            Total
            <br />
            <em>Rewards</em>
            <br />
            Essentials
          </h1>
          <p className="ess-cover-desc">
            Twenty-five easy to read articles covering compensation, benefits, pay equity,
            analytics, incentives, and the future of HR rewards — for professionals who lead
            with insight.
          </p>
          <Link href="/articles/all" className="ess-cover-btn">
            Browse All Articles →
          </Link>
        </div>
        <div className="ess-cover-stats">
          <div>
            <div className="ess-stat-n">25</div>
            <div className="ess-stat-l">Articles</div>
          </div>
          <div>
            <div className="ess-stat-n">12</div>
            <div className="ess-stat-l">Topics</div>
          </div>
        </div>
      </section>
    </div>
  );
}
