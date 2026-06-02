import Link from "next/link";
import type { EssentialArticle } from "@/lib/articles/essentials";
import { ESSENTIALS_ARTICLES } from "@/lib/articles/essentials";
import { ReadAloudButton } from "@/components/article/ReadAloudButton";
import { ReadingProgress } from "@/components/articles/ReadingProgress";
import { ArticleKeyboardNav } from "@/components/articles/ArticleKeyboardNav";
import { articlePlainText } from "@/lib/articles/utils";

export function EssentialArticleView({ article }: { article: EssentialArticle }) {
  const prev = ESSENTIALS_ARTICLES.find((a) => a.id === article.id - 1);
  const next = ESSENTIALS_ARTICLES.find((a) => a.id === article.id + 1);
  const plainText = articlePlainText(article);

  return (
    <>
      <ArticleKeyboardNav prevSlug={prev?.slug} nextSlug={next?.slug} />
      <ReadingProgress />
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
                {article.paragraphs.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}

                {article.pullquote && (
                  <blockquote className="ess-pullquote">
                    <span className="ess-pq-mark">“</span>
                    {article.pullquote}
                    <span className="ess-pq-mark">”</span>
                  </blockquote>
                )}

                {article.takeaways.length > 0 && (
                  <div
                    className="ess-takeaways"
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
