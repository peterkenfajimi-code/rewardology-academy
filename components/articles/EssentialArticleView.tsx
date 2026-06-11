"use client";

import Link from "next/link";
import type { EssentialArticle } from "@/lib/articles/essentials";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { ReadAloudButton } from "@/components/article/ReadAloudButton";
import {
  ArticleReadingProgress,
  ArticleXpBanner,
  useArticleRead,
} from "@/components/articles/ArticleReadTracker";
import { ArticleKeyboardNav } from "@/components/articles/ArticleKeyboardNav";
import { articlePlainText, sectionParagraphs } from "@/lib/articles/utils";

function RelatedCard({ id, color }: { id: number; color: string }) {
  const related = ESSENTIALS_ARTICLES.find((a) => a.id === id);
  if (!related) return null;
  return (
    <Link
      href={`/articles/${related.slug}`}
      className="ess-rel-card"
      style={{ ["--article-color" as string]: color }}
    >
      <div className="ess-rel-cat" style={{ color: related.color }}>
        {related.category}
      </div>
      <div className="ess-rel-title">{related.title}</div>
      <div className="ess-rel-meta">
        ⏱ {related.readTime} · Article {related.num}
      </div>
    </Link>
  );
}

export function EssentialArticleView({ article }: { article: EssentialArticle }) {
  const prev = ESSENTIALS_ARTICLES.find((a) => a.id === article.id - 1);
  const next = ESSENTIALS_ARTICLES.find((a) => a.id === article.id + 1);
  const plainText = articlePlainText(article);
  const read = useArticleRead(article.id);

  const sectionIds = [
    ...article.sections.map((_, i) => `sec-${article.id}-${i}`),
    `sec-${article.id}-scenario`,
    `sec-${article.id}-mistakes`,
    `sec-${article.id}-practical`,
    `sec-${article.id}-takeaways`,
  ];

  return (
    <>
      <ArticleKeyboardNav prevSlug={prev?.slug} nextSlug={next?.slug} />
      <ArticleReadingProgress width={read.progressWidth} />
      <div
        className="essentials-root min-h-screen"
        style={{ ["--article-color" as string]: article.color }}
      >
        <div className="ess-rd-lay">
          <nav className="ess-side-nav" aria-label="Article navigation">
            {ESSENTIALS_ARTICLES.map((a) => (
              <Link
                key={a.id}
                href={`/articles/${a.slug}`}
                className={`ess-snb${a.id === article.id ? " on" : ""}`}
                style={{ ["--article-color" as string]: a.color }}
                title={a.title}
              >
                {a.num}
              </Link>
            ))}
          </nav>

          <div className="ess-art-wrap">
            <article>
              <header
                className="ess-art-hero"
                style={{
                  background: `linear-gradient(160deg, ${article.color}14 0%, ${article.color}04 100%)`,
                }}
              >
                <div className="ess-art-hero-in">
                  <div className="ess-art-meta">
                    <span className="ess-art-num">#{article.num}</span>
                    <span
                      className="ess-art-cat"
                      style={{
                        color: article.color,
                        borderColor: `${article.color}44`,
                        background: `${article.color}12`,
                      }}
                    >
                      {article.category}
                    </span>
                    <span className="ess-art-time">⏱ {article.readTime}</span>
                    <span className="ess-art-xp" style={{ color: article.color }}>
                      ⚡ {article.xp} XP
                    </span>
                  </div>
                  <h1 className="ess-art-h1">{article.title}</h1>
                  <p className="ess-art-sub">{article.subtitle}</p>
                  <div className="ess-art-rule" style={{ background: article.color }} />
                  <div className="ess-read-aloud">
                    <ReadAloudButton text={plainText} />
                  </div>
                </div>
              </header>

              <div className="ess-art-body">
                {article.intro && <p className="ess-art-intro">{article.intro}</p>}

                {article.toc.length > 0 && (
                  <nav className="ess-toc" aria-label="Table of contents">
                    <div className="ess-toc-label">In This Article</div>
                    <ol className="ess-toc-list">
                      {article.toc.map((t, i) => (
                        <li key={t}>
                          <a href={`#${sectionIds[i] ?? `sec-${article.id}-${i}`}`}>{t}</a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}

                {article.sections.map((section, i) => (
                  <section key={section.h2}>
                    <h2 className="ess-art-h2" id={`sec-${article.id}-${i}`}>
                      {section.h2}
                    </h2>
                    {sectionParagraphs(section.body).map((p) => (
                      <p key={p.slice(0, 40)}>{p}</p>
                    ))}
                    {section.callout && (
                      <div className="ess-callout">
                        <div className="ess-callout-label">{section.callout.label}</div>
                        <div className="ess-callout-body">{section.callout.body}</div>
                      </div>
                    )}
                  </section>
                ))}

                {article.scenario && (
                  <div className="ess-scenario" id={`sec-${article.id}-scenario`}>
                    <div className="ess-sc-ey">Scenario</div>
                    <div className="ess-sc-title">{article.scenario.title}</div>
                    <div className="ess-sc-body">{article.scenario.body}</div>
                  </div>
                )}

                {article.mistakes.length > 0 && (
                  <section id={`sec-${article.id}-mistakes`}>
                    <h2 className="ess-art-h2">Three Common Mistakes to Avoid</h2>
                    <div className="ess-mistakes">
                      {article.mistakes.map((m, i) => (
                        <div key={m.t} className="ess-mk-item">
                          <div className="ess-mk-num">{String(i + 1).padStart(2, "0")}</div>
                          <div>
                            <div className="ess-mk-t">{m.t}</div>
                            <div className="ess-mk-d">{m.d}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {article.practical && (
                  <div className="ess-practical" id={`sec-${article.id}-practical`}>
                    <div className="ess-prac-label">Your Action Steps</div>
                    <div className="ess-prac-title">{article.practical.title}</div>
                    <div className="ess-prac-steps">
                      {article.practical.steps.map((step, i) => (
                        <div key={step.slice(0, 30)} className="ess-prac-step">
                          <span className="ess-prac-sn">{i + 1}</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {article.pullquote && (
                  <blockquote className="ess-pullquote">
                    <span className="ess-pq-mark">“</span>
                    {article.pullquote}
                    <span className="ess-pq-mark">”</span>
                  </blockquote>
                )}

                {article.closingNote && (
                  <div className="ess-closing">
                    <div className="ess-closing-label">Coming Up</div>
                    <div className="ess-closing-body">{article.closingNote}</div>
                  </div>
                )}

                {article.takeaways.length > 0 && (
                  <div
                    className="ess-takeaways"
                    id={`sec-${article.id}-takeaways`}
                    style={{
                      borderColor: article.color,
                      background: `${article.color}0c`,
                    }}
                  >
                    <div className="ess-tk-head" style={{ color: article.color }}>
                      Key Takeaways
                    </div>
                    <ul className="ess-tk-ul">
                      {article.takeaways.map((t) => (
                        <li key={t}>
                          <span className="ess-tk-arrow" style={{ color: article.color }}>
                            →
                          </span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {(article.course || article.quiz) && (
                  <div className="ess-art-cta-row">
                    {article.course && (
                      <Link href="/courses" className="ess-art-cta primary">
                        <span className="ess-art-cta-icon" aria-hidden>
                          📚
                        </span>
                        <span>
                          <span className="ess-art-cta-dir">Continue Learning</span>
                          <span className="ess-art-cta-title">{article.course}</span>
                          <span className="ess-art-cta-sub">Interactive lessons and module quizzes</span>
                        </span>
                      </Link>
                    )}
                    {article.quiz && (
                      <Link href="/quizzes" className="ess-art-cta secondary">
                        <span className="ess-art-cta-icon" aria-hidden>
                          🎯
                        </span>
                        <span>
                          <span className="ess-art-cta-dir">Test Yourself</span>
                          <span className="ess-art-cta-title">{article.quiz} Quiz</span>
                          <span className="ess-art-cta-sub">Practice questions · earn XP</span>
                        </span>
                      </Link>
                    )}
                  </div>
                )}

                {article.related.length > 0 && (
                  <div className="ess-related">
                    <div className="ess-related-label">Related Reading</div>
                    <div className="ess-related-grid">
                      {article.related.map((id) => (
                        <RelatedCard key={id} id={id} color={article.color} />
                      ))}
                    </div>
                  </div>
                )}

                <ArticleXpBanner
                  xp={article.xp}
                  color={article.color}
                  showBanner={read.showBanner}
                  completed={read.completed}
                  authenticated={read.authenticated}
                  articlesRead={read.articlesRead}
                  articleXpTotal={read.articleXpTotal}
                  maxArticleXp={read.maxArticleXp}
                  articlesTotal={read.articlesTotal}
                />
              </div>

              <footer className="ess-art-foot">
                {prev ? (
                  <Link href={`/articles/${prev.slug}`} className="ess-afb">
                    <span className="ess-afb-d">← Previous</span>
                    <span className="ess-afb-t">{prev.title}</span>
                  </Link>
                ) : (
                  <div />
                )}
                {next ? (
                  <Link href={`/articles/${next.slug}`} className="ess-afb">
                    <span className="ess-afb-d">Next →</span>
                    <span className="ess-afb-t">{next.title}</span>
                  </Link>
                ) : null}
              </footer>
            </article>
          </div>
        </div>
      </div>
    </>
  );
}
