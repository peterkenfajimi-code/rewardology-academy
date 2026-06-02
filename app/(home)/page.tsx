import Link from "next/link";
import { AuthControls } from "@/components/auth/AuthControls";
import { HomeEffects } from "@/components/home/HomeEffects";
import { HomeQuizPanel } from "@/components/home/HomeQuizPanel";
import { HomeCartoons } from "@/components/home/HomeCartoons";
import { HomeNews } from "@/components/home/HomeNews";
import { getEssentialById, type EssentialArticle } from "@/lib/articles/essentials";

const NAV = [
  { href: "/", label: "Home", active: true },
  { href: "/articles", label: "Articles" },
  { href: "/courses", label: "Courses" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/comics", label: "Comics" },
];

const MARQUEE = [
  "Total Rewards",
  "Compensation Design",
  "Pay Equity",
  "Benefits Strategy",
  "Pay Transparency",
  "HR Analytics",
  "Executive Rewards",
  "Global Compensation",
  "Salary Structures",
];

const COURSES = [
  { href: "/courses", banner: "cc-banner-1", icon: "📐", badge: "Beginner", name: "Compensation Fundamentals", desc: "Build salary structures, master job evaluation methods, and create the foundations of a fair pay system from scratch.", price: "Free", free: true, meta: "8 modules · 3hrs", delay: "reveal-d1" },
  { href: "/courses", banner: "cc-banner-4", icon: "🏛️", badge: "Advanced", name: "Coming Soon", desc: "Coming Soon", price: "$--", free: false, meta: "12 modules · 6hrs", delay: "reveal-d2" },
  { href: "/courses", banner: "cc-banner-2", icon: "⚖️", badge: "Intermediate", name: "Coming Soon", desc: "Coming Soon", price: "$--", free: false, meta: "10 modules · 5hrs", delay: "reveal-d3" },
];

function articleHref(a?: EssentialArticle) {
  return a ? `/articles/${a.slug}` : "/articles/all";
}

export default function HomePage() {
  const featured = getEssentialById(1);
  const side = [
    { a: getEssentialById(10), color: "#3A7D44", desc: "Practical steps for 2026 — structures, communication, and governance before you open the books." },
    { a: getEssentialById(4), color: "#B84B4B", desc: "Identify gaps, run your first analysis, and build the governance that stops inequity from creeping back in." },
    { a: getEssentialById(9), color: "#B84B4B", desc: "When incentive plans work, when they fail, and exactly what separates one from the other." },
  ];
  const row2 = [
    { a: getEssentialById(3), color: "#6B4C9A", desc: "Grades, midpoints, and the governance rules that make a structure actually work." },
    { a: getEssentialById(8), color: "#6B4C9A", desc: "Move beyond off-the-shelf packages and design programs your workforce truly wants." },
    { a: getEssentialById(14), color: "#B84B4B", desc: "Transparency, skills-based pay, and the analytics revolution reshaping the field." },
  ];

  return (
    <>
      <HomeEffects />

      <nav className="home-nav">
        <Link href="/" className="nav-brand">
          <span className="nav-brand-mark">R</span>
          Rewardology Academy
        </Link>
        <ul className="nav-links">
          {NAV.map((n) => (
            <li key={n.label}>
              <Link href={n.href} className={n.active ? "active" : ""}>
                {n.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/quizzes" className="nav-cta">
              Take today&apos;s quiz
            </Link>
          </li>
          <li>
            <AuthControls />
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-mesh" />
        <div className="hero-grid" />
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-tag">The Global HR Learning Platform</div>
            <h1 className="hero-h1">
              <strong>Build a</strong>
              World&#8209;Class
              <br />
              <em>Total Rewards</em>
              <br />
              Career.
            </h1>
            <p className="hero-desc">
              Learn compensation, benefits, pay transparency, and workforce analytics through courses,
              articles, quizzes, and visual storytelling — designed for ambitious HR professionals.
            </p>
            <div className="hero-actions">
              <Link href="/courses" className="btn-primary">
                Explore Academy &nbsp;→
              </Link>
              <Link href="/quizzes" className="btn-ghost">
                Take Today&apos;s Quiz
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hstat-num">
                  25<span>+</span>
                </div>
                <div className="hstat-label">Free Articles</div>
              </div>
              <div>
                <div className="hstat-num">
                  6<span>+</span>
                </div>
                <div className="hstat-label">Courses</div>
              </div>
              <div>
                <div className="hstat-num">
                  60<span>xp</span>
                </div>
                <div className="hstat-label">Daily Quizzes</div>
              </div>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-top">
              <div className="challenge-eyebrow">
                <span className="challenge-dot" /> Today&apos;s Challenge
              </div>
              <div className="challenge-title">Compensation Basics Quiz</div>
              <div className="challenge-xp">⚡ Earn up to 60 XP</div>
            </div>
            <div className="hero-card-bottom">
              <div className="xp-bar-label">
                <span>Your XP Progress</span>
                <span>420 / 1000</span>
              </div>
              <div className="xp-bar">
                <div className="xp-fill" />
              </div>
              <div className="mini-courses">
                <Link href="/courses" className="mini-course">
                  <div className="mc-icon" style={{ background: "linear-gradient(135deg,#0C4A6E,#0891B2)" }}>
                    📐
                  </div>
                  <div>
                    <div className="mc-name">Compensation Fundamentals</div>
                    <div className="mc-meta">Salary structures · Job evaluation</div>
                  </div>
                  <div className="mc-price">Free</div>
                </Link>
                <Link href="/courses" className="mini-course">
                  <div className="mc-icon" style={{ background: "linear-gradient(135deg,#7F1D1D,#DC2626)" }}>
                    🏛️
                  </div>
                  <div>
                    <div className="mc-name">Coming Soon</div>
                    <div className="mc-meta">Advanced · In development</div>
                  </div>
                  <div className="mc-price">$--</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span className="marquee-item" key={i}>
              {m}
              <span className="marquee-sep" />
            </span>
          ))}
        </div>
      </div>

      {/* COURSES */}
      <section className="section courses-section">
        <div className="section-inner">
          <div className="section-hd reveal">
            <div>
              <div className="section-eyebrow">Learning Paths</div>
              <h2 className="section-title">
                Featured <em>Courses</em>
              </h2>
              <p className="section-sub">
                Structured learning built for HR professionals who want to master every corner of
                Total Rewards.
              </p>
            </div>
            <Link href="/courses" className="section-link">
              View all courses →
            </Link>
          </div>
          <div className="courses-grid">
            {COURSES.map((c) => (
              <Link href={c.href} className={`course-card reveal ${c.delay}`} key={c.badge}>
                <div className={`course-card-banner ${c.banner}`}>
                  <div className="cc-icon">{c.icon}</div>
                  <span className="cc-badge">{c.badge}</span>
                </div>
                <div className="course-card-body">
                  <div className="cc-name">{c.name}</div>
                  <p className="cc-desc">{c.desc}</p>
                  <div className="cc-footer">
                    <span className={`cc-price${c.free ? " free" : ""}`}>{c.price}</span>
                    <span className="cc-meta">{c.meta}</span>
                    <span className="cc-arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ARTICLES */}
      <section className="section articles-section">
        <div className="section-inner">
          <div className="section-hd reveal">
            <div>
              <div className="section-eyebrow">Total Rewards Essentials</div>
              <h2 className="section-title">
                Essential <em>Reading</em>
              </h2>
              <p className="section-sub">
                25 practitioner-written articles covering every pillar of modern Total Rewards
                strategy.
              </p>
            </div>
            <Link href="/articles/all" className="section-link">
              View all 25 articles →
            </Link>
          </div>
          <div className="articles-grid">
            <Link href={articleHref(featured)} className="article-featured reveal">
              <div className="af-bg" />
              <div className="af-grid" />
              <div className="af-overlay" />
              <div className="af-content">
                <div className="af-num">01</div>
                <div className="af-cat">{featured?.category ?? "Total Rewards Fundamentals"}</div>
                <div className="af-title">{featured?.title ?? "What Is Total Rewards?"}</div>
                <div className="af-desc">
                  A practical guide for HR professionals entering the field — covering all five
                  pillars of modern Total Rewards strategy.
                </div>
                <div className="af-cta">Read article →</div>
              </div>
            </Link>
            <div className="articles-side">
              {side.map((s, i) => (
                <Link
                  href={articleHref(s.a)}
                  className={`article-card reveal reveal-d${i + 1}`}
                  key={s.a?.id ?? i}
                >
                  <div className="ac-num">{s.a?.num ?? "--"}</div>
                  <div className="ac-content">
                    <div className="ac-cat" style={{ color: s.color }}>
                      {s.a?.category}
                    </div>
                    <div className="ac-title">
                      {s.a?.title}
                      {s.a?.subtitle ? `: ${s.a.subtitle}` : ""}
                    </div>
                    <div className="ac-desc">{s.desc}</div>
                  </div>
                  <div className="ac-arrow">→</div>
                </Link>
              ))}
            </div>
          </div>
          <div className="articles-row2">
            {row2.map((r, i) => (
              <Link
                href={articleHref(r.a)}
                className={`article-mini reveal reveal-d${i + 1}`}
                key={r.a?.id ?? i}
              >
                <div className="am-cat" style={{ color: r.color }}>
                  {r.a?.category}
                </div>
                <div className="am-title">{r.a?.title}</div>
                <div className="am-desc">{r.desc}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* QUIZ */}
      <section className="section quiz-section">
        <div className="quiz-bg" />
        <div className="section-inner">
          <div className="quiz-inner">
            <div className="quiz-left reveal">
              <div className="section-eyebrow">Daily Quizzes</div>
              <h2 className="section-title">
                Learn by <em>Doing</em>
                <br />
                Every Day.
              </h2>
              <p className="section-sub">
                Short, sharp quizzes calibrated to real HR situations. Build knowledge the way
                professionals actually retain it — through practice, not passive reading.
              </p>
              <div className="quiz-features">
                <div className="qf">
                  <div className="qf-icon" style={{ background: "rgba(200,150,62,.15)" }}>
                    ⚡
                  </div>
                  <div>
                    <div className="qf-title">Earn XP with every answer</div>
                    <div className="qf-desc">
                      Each correct response builds your score toward badges and certification
                      milestones.
                    </div>
                  </div>
                </div>
                <div className="qf">
                  <div className="qf-icon" style={{ background: "rgba(12,107,101,.2)" }}>
                    🎯
                  </div>
                  <div>
                    <div className="qf-title">Topic-focused challenges</div>
                    <div className="qf-desc">
                      From compa-ratio to executive LTI — quizzes span every corner of Total Rewards.
                    </div>
                  </div>
                </div>
                <div className="qf">
                  <div className="qf-icon" style={{ background: "rgba(107,76,154,.2)" }}>
                    📈
                  </div>
                  <div>
                    <div className="qf-title">Track your progress</div>
                    <div className="qf-desc">
                      See which topics you&apos;ve mastered and which need more attention on your
                      dashboard.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <HomeQuizPanel />
          </div>
        </div>
      </section>

      {/* COMICS */}
      <HomeCartoons />

      {/* TESTIMONIALS */}
      <section className="section proof-section">
        <div className="section-inner">
          <div className="section-hd reveal">
            <div>
              <div className="section-eyebrow">Testimonials</div>
              <h2 className="section-title">
                Trusted by HR <em>Professionals</em>
              </h2>
            </div>
          </div>
          <div className="proof-grid">
            {[
              { d: "reveal-d1", avatar: "A", bg: "linear-gradient(135deg,#0C4A6E,#0891B2)", text: "Rewardology is the only platform that explains compensation concepts the way practitioners actually think. I transitioned into Total Rewards in six months using these materials.", name: "Amara Osei", role: "Total Rewards Analyst · Lagos" },
              { d: "reveal-d2", avatar: "D", bg: "linear-gradient(135deg,#064E3B,#059669)", text: "The pay equity module alone saved our organization from a costly audit. The practical frameworks here go far beyond anything in a generic HR certification.", name: "Daniel Mensah", role: "Senior HR Manager · Accra" },
              { d: "reveal-d3", avatar: "S", bg: "linear-gradient(135deg,#3B0764,#7C3AED)", text: "I read the 25 articles cover to cover before my first compensation director interview. The vocabulary, frameworks, and confidence I walked in with were completely different.", name: "Sophia Nkrumah", role: "Compensation Director · Nairobi" },
            ].map((p) => (
              <div className={`proof-card reveal ${p.d}`} key={p.name}>
                <div className="proof-stars">★★★★★</div>
                <div className="proof-text">&ldquo;{p.text}&rdquo;</div>
                <div className="proof-author">
                  <div className="proof-avatar" style={{ background: p.bg }}>
                    {p.avatar}
                  </div>
                  <div>
                    <div className="proof-name">{p.name}</div>
                    <div className="proof-role">{p.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NEWS */}
      <HomeNews />

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="section-inner">
          <div className="cta-inner reveal">
            <h2 className="cta-title">
              Start Building Your
              <br />
              <em>Rewards Expertise</em> Today.
            </h2>
            <p className="cta-desc">
              25 free articles, daily quizzes, and structured courses — everything you need to become
              the most capable person in the room.
            </p>
            <div className="cta-actions">
              <Link href="/courses" className="btn-primary">
                Explore All Courses →
              </Link>
              <Link href="/articles/all" className="btn-ghost">
                Browse Free Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="home-footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div>
              <div className="footer-brand">Rewardology Academy</div>
              <div className="footer-tagline">
                The global learning platform for Total Rewards, Compensation &amp; Benefits
                professionals who want to lead with expertise.
              </div>
            </div>
            <div>
              <div className="footer-col-title">Learn</div>
              <ul className="footer-links">
                <li><Link href="/articles">Articles</Link></li>
                <li><Link href="/courses">Courses</Link></li>
                <li><Link href="/quizzes">Quizzes</Link></li>
                <li><Link href="/comics">Comics</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Topics</div>
              <ul className="footer-links">
                <li><Link href="/articles/all">Compensation Design</Link></li>
                <li><Link href="/articles/all">Pay Equity</Link></li>
                <li><Link href="/articles/all">Benefits Strategy</Link></li>
                <li><Link href="/articles/all">HR Analytics</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Platform</div>
              <ul className="footer-links">
                <li><Link href="/about">About</Link></li>
                <li><Link href="/setup">Integration Status</Link></li>
                <li><Link href="/privacy">Privacy</Link></li>
                <li><Link href="/terms">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Rewardology Academy · Total Rewards Learning Platform</span>
            <div className="footer-status">
              <span className="status-dot" /> All systems operational
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
