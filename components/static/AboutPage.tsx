import Link from "next/link";
import { StaticPageHero } from "@/components/static/StaticPageHero";
import { DICTIONARY_TERM_COUNT } from "@/lib/dictionary/terms";
import "@/styles/static-pages.css";

const PILLARS = [
  {
    icon: "◈",
    title: "Structured Courses",
    body: "Five courses from Total Rewards Foundations through to HR Analytics — each with six in-depth lessons, certificates, and XP rewards.",
  },
  {
    icon: "📰",
    title: "Practitioner Articles",
    body: "25 long-form articles covering every pillar of modern Total Rewards strategy — written for working HR professionals, not textbooks.",
  },
  {
    icon: "⚡",
    title: "Daily Quizzes",
    body: "Short, targeted quizzes calibrated to real HR situations. Earn XP daily, track your knowledge gaps, and build fluency through practice.",
  },
  {
    icon: "📖",
    title: "The TR Dictionary",
    body: `${DICTIONARY_TERM_COUNT} original Total Rewards terms — each with a practitioner note, worked example, and formula where applicable. The most comprehensive practitioner C&B reference available.`,
  },
  {
    icon: "🎨",
    title: "Comics Series",
    body: "Illustrated stories that bring Total Rewards concepts to life — retention conversations, pay transparency challenges, recognition that works.",
  },
  {
    icon: "📊",
    title: "XP Dashboard",
    body: "A unified progress tracker that aggregates your learning across every module — courses, articles, quizzes, and dictionary — into one career profile.",
  },
] as const;

const VALUES = [
  {
    marker: "⊞",
    title: "Depth over decoration",
    body: "Every piece of content here is written for someone making real decisions — not someone preparing for a multiple choice exam. We trade comprehensiveness for depth every time.",
  },
  {
    marker: "⊜",
    title: "Accessibility first",
    body: "We believe high-quality Total Rewards education should be within reach of every professional. The majority of our content is free to access, and where paid content exists, it is priced to reflect genuine value — not to gate what every practitioner deserves to know.",
  },
  {
    marker: "◎",
    title: "Context matters",
    body: "Pay equity in Lagos is not the same as pay equity in London. Rewardology is built with awareness that Total Rewards practice varies significantly by market, sector, and regulatory environment.",
  },
  {
    marker: "◆",
    title: "Practical, not theoretical",
    body: "Every framework, model, and concept is taught through the lens of application — what does this look like in a real salary review, a real pay equity audit, a real market pricing exercise?",
  },
] as const;

export function AboutPage() {
  return (
    <div className="sp-root">
      <StaticPageHero
        eyebrow="Our Story"
        title={
          <>
            Built for the people who <em>build</em> reward systems.
          </>
        }
        subtitle="Rewardology Academy exists because Total Rewards is one of the most consequential disciplines in HR — and one of the most underserved in terms of practical, accessible, practitioner-level education."
      />

      <div className="sp-content-wide">
        <section className="sp-section sp-section-narrow">
          <p className="sp-section-eyebrow">Mission</p>
          <h2>
            Expertise shouldn&apos;t be <em>expensive.</em>
          </h2>
          <p className="sp-lead">
            The best compensation and benefits knowledge has historically lived behind professional
            certification programmes costing thousands of dollars, or inside the major consulting
            firms — inaccessible to most of the HR professionals who need it most, especially across
            Africa and other emerging markets.
          </p>
          <p className="sp-lead">
            Rewardology Academy was built to change that. The majority of content on this platform is
            free to access, and everything here is built with working professionals in mind — because
            HR professionals who build equitable, competitive, well-communicated reward systems make
            workplaces better for thousands of employees, and that work deserves better tools.
          </p>
        </section>

        <div className="sp-divider" />

        <section className="sp-section sp-section-mid">
          <p className="sp-section-eyebrow center">The Platform</p>
          <h2 className="center">
            Everything in one <em>place.</em>
          </h2>
          <p style={{ textAlign: "center", fontSize: 14, color: "var(--sp-dim)", marginBottom: 0 }}>
            Built end-to-end for Total Rewards and C&amp;B professionals.
          </p>
          <div className="sp-stat-row">
            <div className="sp-stat-cell">
              <div className="sp-stat-n">5</div>
              <div className="sp-stat-l">Expert Courses</div>
            </div>
            <div className="sp-stat-cell">
              <div className="sp-stat-n">25</div>
              <div className="sp-stat-l">Practitioner Articles</div>
            </div>
            <div className="sp-stat-cell">
              <div className="sp-stat-n">10</div>
              <div className="sp-stat-l">Topic Quizzes</div>
            </div>
            <div className="sp-stat-cell">
              <div className="sp-stat-n">{DICTIONARY_TERM_COUNT}</div>
              <div className="sp-stat-l">Dictionary Terms</div>
            </div>
          </div>
        </section>

        <div className="sp-divider" />

        <section className="sp-section sp-section-mid">
          <p className="sp-section-eyebrow">Learning Modules</p>
          <h2>
            Six ways to <em>learn.</em>
          </h2>
          <div className="sp-pillars">
            {PILLARS.map((p) => (
              <div key={p.title} className="sp-pillar">
                <div className="sp-pillar-icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="sp-divider" />

        <section className="sp-section sp-section-narrow">
          <p className="sp-section-eyebrow">Audience</p>
          <h2>
            Who <em>Rewardology</em> is for.
          </h2>
          <p>
            Rewardology Academy is built for HR generalists growing into specialist roles, C&amp;B
            analysts building their technical depth, HR managers responsible for pay decisions who
            want more rigour, and Total Rewards leaders who want a reference platform they can
            recommend to their teams.
          </p>
          <p>
            The platform is designed with a particular focus on professionals across Africa and other
            emerging markets — where Total Rewards expertise is in high demand but where
            high-quality, context-appropriate learning resources have historically been scarce or
            prohibitively priced.
          </p>
        </section>

        <div className="sp-divider" />

        <section className="sp-section sp-section-mid">
          <p className="sp-section-eyebrow">Principles</p>
          <h2>
            What we <em>believe.</em>
          </h2>
          <div className="sp-values">
            {VALUES.map((v) => (
              <div key={v.title} className="sp-value">
                <div className="sp-value-marker">{v.marker}</div>
                <div className="sp-value-text">
                  <h4>{v.title}</h4>
                  <p>{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="sp-divider" />

        <section className="sp-section sp-section-narrow">
          <p className="sp-section-eyebrow">Get in Touch</p>
          <h2>
            We&apos;d love to <em>hear from you.</em>
          </h2>
          <p>
            Whether you have feedback on the platform, a suggestion for a course topic, a question
            about content, or a partnership enquiry — reach us at{" "}
            <a href="mailto:hello@rewardologyacademy.com">hello@rewardologyacademy.com</a>. We read
            every message.
          </p>
        </section>

        <div className="sp-cta-band">
          <h2>
            Start learning <em>today.</em>
          </h2>
          <p>
            Courses · articles · daily quizzes · {DICTIONARY_TERM_COUNT}-term dictionary. Create a
            free account to get started.
          </p>
          <div className="sp-cta-btns">
            <Link href="/courses" className="sp-btn-primary">
              Explore All Courses →
            </Link>
            <Link href="/articles/all" className="sp-btn-ghost">
              Browse Articles
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
