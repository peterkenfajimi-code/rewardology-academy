"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { BrowserVoiceBar } from "@/components/tts/BrowserVoiceBar";
import { getEssentialById } from "@/lib/articles/essentials";
import {
  DICTIONARY_CATEGORIES,
  DICTIONARY_LETTERS,
  DICTIONARY_TERMS,
  DICTIONARY_TERM_COUNT,
  DICTIONARY_XP_PER_TERM,
  type DictionaryTerm,
} from "@/lib/dictionary/terms";
import {
  earnDictionaryTermXp,
  mergeDictionaryFromServer,
  readDictionaryReadSet,
  readDictionaryXp,
  syncDictionaryTermToAccount,
} from "@/lib/dictionary/progress";
import {
  lessonHref,
  previewText,
  termCardId,
  termPlainText,
} from "@/lib/dictionary/utils";
import "@/styles/dictionary.css";

function articleHref(articleId: number): string | null {
  const article = getEssentialById(articleId);
  return article ? `/articles/${article.slug}` : null;
}

function matchesTerm(
  t: DictionaryTerm,
  letter: string,
  cat: string,
  query: string
): boolean {
  if (letter !== "all" && t.term[0]?.toUpperCase() !== letter) return false;
  if (cat !== "all" && t.cat !== cat) return false;
  if (query) {
    const q = query.toLowerCase();
    const hay = [
      t.term,
      t.abbr ?? "",
      t.definition,
      t.note ?? "",
      t.example ?? "",
      t.cat,
    ]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function termOfDayIndex(): number {
  return Math.floor(Date.now() / 86400000) % DICTIONARY_TERMS.length;
}

export function DictionaryCentre() {
  const { user } = useAuth();
  const [filterLetter, setFilterLetter] = useState("all");
  const [filterCat, setFilterCat] = useState("all");
  const [filterQ, setFilterQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [readSet, setReadSet] = useState<Set<string>>(() => new Set());
  const [dictXp, setDictXp] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function refreshLocal() {
      setReadSet(readDictionaryReadSet());
      setDictXp(readDictionaryXp());
      setMounted(true);
    }

    (async () => {
      refreshLocal();
      try {
        const res = await fetch("/api/dictionary/progress", { cache: "no-store" });
        const data = (await res.json()) as {
          authenticated?: boolean;
          terms?: string[];
          dictionaryXp?: number;
        };
        if (cancelled) return;
        if (data.authenticated && data.terms) {
          mergeDictionaryFromServer(data.terms, data.dictionaryXp ?? 0);
          const localTerms = readDictionaryReadSet();
          for (const term of localTerms) {
            if (!data.terms.includes(term)) {
              await syncDictionaryTermToAccount(term, DICTIONARY_XP_PER_TERM);
            }
          }
          if (!cancelled) refreshLocal();
        }
      } catch {
        /* local cache only */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const awardTerm = useCallback(async (term: string) => {
    const earned = earnDictionaryTermXp(term, DICTIONARY_XP_PER_TERM);
    setReadSet(readDictionaryReadSet());
    setDictXp(readDictionaryXp());
    if (earned > 0) {
      await syncDictionaryTermToAccount(term, DICTIONARY_XP_PER_TERM);
      setDictXp(readDictionaryXp());
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setFilterQ(searchInput.trim()), 220);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expandedId) setExpandedId(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expandedId]);

  const totd = useMemo(() => DICTIONARY_TERMS[termOfDayIndex()], []);

  const visible = useMemo(
    () => DICTIONARY_TERMS.filter((t) => matchesTerm(t, filterLetter, filterCat, filterQ)),
    [filterLetter, filterCat, filterQ]
  );

  const openTerm = useCallback(
    (termName: string, clearFilters = false) => {
      if (clearFilters) {
        setFilterLetter("all");
        setFilterCat("all");
        setFilterQ("");
        setSearchInput("");
      }
      const t = DICTIONARY_TERMS.find((x) => x.term.toLowerCase() === termName.toLowerCase());
      if (!t) return;
      const id = termCardId(t.term);
      setExpandedId(id);
      void awardTerm(t.term);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
    },
    [awardTerm]
  );

  const handleCardClick = useCallback(
    (t: DictionaryTerm) => {
      const id = termCardId(t.term);
      if (expandedId === id) return;
      setExpandedId(id);
      void awardTerm(t.term);
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    },
    [expandedId, awardTerm]
  );

  const resultLabel =
    visible.length === DICTIONARY_TERM_COUNT
      ? `Showing all ${DICTIONARY_TERM_COUNT} terms`
      : `${visible.length} of ${DICTIONARY_TERM_COUNT} terms`;

  return (
    <div className="dict-root">
      <div className="dict-hero">
        <div className="dict-hero-mesh" aria-hidden />
        <div className="dict-hero-grid" aria-hidden />
        <div className="dict-eyebrow">Total Rewards Dictionary</div>
        <h1 className="dict-h1">
          The Total Rewards <em>Dictionary</em>
        </h1>
        <p className="dict-desc">
          {DICTIONARY_TERM_COUNT} practitioner-depth entries across {DICTIONARY_CATEGORIES.length}{" "}
          disciplines — free, searchable, and cross-linked to courses and articles.
        </p>
        <div className="dict-srch-wrap">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search terms, definitions, examples…"
            autoComplete="off"
            spellCheck={false}
          />
          {searchInput ? (
            <button
              type="button"
              className="dict-srch-clear"
              onClick={() => {
                setSearchInput("");
                setFilterQ("");
                setExpandedId(null);
              }}
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <div className="dict-stats">
        <div>
          <div className="dict-stat-num">{DICTIONARY_TERM_COUNT}</div>
          <div className="dict-stat-lbl">Terms</div>
        </div>
        <div>
          <div className="dict-stat-num">{DICTIONARY_CATEGORIES.length}</div>
          <div className="dict-stat-lbl">Disciplines</div>
        </div>
        <div>
          <div className="dict-stat-num">{mounted ? dictXp : 0}</div>
          <div className="dict-stat-lbl">{user ? "Your XP · synced" : "Your XP"}</div>
        </div>
      </div>

      <div className="totd-outer">
        <div className="totd-card" data-initial={totd.term[0]?.toUpperCase() ?? "T"}>
          <span className="totd-lbl">Term of the Day</span>
          <div className="totd-term">{totd.term}</div>
          {totd.abbr ? <div className="totd-abbr">Abbreviation: {totd.abbr}</div> : null}
          <div className="totd-cat">{totd.cat}</div>
          <div className="totd-def">{totd.definition}</div>
          <button type="button" className="totd-btn" onClick={() => openTerm(totd.term, true)}>
            Explore this term →
          </button>
        </div>
      </div>

      <div className="dict-controls">
        <div className="az-strip">
          <button
            type="button"
            className={`az-btn az-all${filterLetter === "all" ? " active" : ""}`}
            onClick={() => {
              setFilterLetter("all");
              setExpandedId(null);
            }}
          >
            All
          </button>
          {DICTIONARY_LETTERS.map((letter) => (
            <button
              key={letter}
              type="button"
              className={`az-btn${filterLetter === letter ? " active" : ""}`}
              onClick={() => {
                setFilterLetter(letter);
                setExpandedId(null);
              }}
            >
              {letter}
            </button>
          ))}
        </div>
        <div className="cat-strip">
          <button
            type="button"
            className={`cat-btn${filterCat === "all" ? " active" : ""}`}
            onClick={() => {
              setFilterCat("all");
              setExpandedId(null);
            }}
          >
            All Categories
          </button>
          {DICTIONARY_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`cat-btn${filterCat === cat ? " active" : ""}`}
              onClick={() => {
                setFilterCat(cat);
                setExpandedId(null);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <section className="dict-terms-section">
        <div className="dict-grid-header">
          <div className="dict-grid-title">All Terms</div>
          <div className="dict-grid-sub">
            {resultLabel}
            {mounted && readSet.size > 0 ? (
              <> · {readSet.size} explored</>
            ) : null}
            {" · +5 XP per term"}
          </div>
        </div>
        <div className="terms-grid">
          {!visible.length ? (
            <div className="empty" style={{ display: "block" }}>
              <h3>No terms found</h3>
              <p>Try a different search term or clear your filters.</p>
            </div>
          ) : (
            visible.map((t) => {
              const id = termCardId(t.term);
              const expanded = expandedId === id;
              const isRead = readSet.has(t.term);
              const xpDone = isRead;
              const artHref = t.article ? articleHref(t.article) : null;

              return (
                <div
                  key={id}
                  id={id}
                  data-term={t.term}
                  className={`tc${expanded ? " expanded" : ""}${isRead ? " read" : ""}`}
                  onClick={() => {
                    if (!expanded) handleCardClick(t);
                  }}
                >
                  <div className="tc-read-dot">✓</div>
                  <div className="tc-head">
                    <div className="tc-top">
                      <div className="tc-name">{t.term}</div>
                      {t.abbr ? <span className="tc-abbr">{t.abbr}</span> : null}
                    </div>
                    <span className="tc-cat">{t.cat}</span>
                  </div>
                  {!expanded ? (
                    <div className="tc-preview">{previewText(t.definition)}</div>
                  ) : null}

                  {expanded ? (
                    <div className="tc-body" data-initial={t.term[0]?.toUpperCase() ?? "T"}>
                      <button
                        type="button"
                        className="close-btn"
                        aria-label="Close"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedId(null);
                        }}
                      >
                        ✕
                      </button>
                      <div className="sec-lbl">Definition</div>
                      <div className="e-def">{t.definition}</div>

                      {t.note ? (
                        <div className="e-note">
                          <div className="sec-lbl">Practitioner Note</div>
                          <p>{t.note}</p>
                        </div>
                      ) : null}

                      {t.formula ? (
                        <div className="e-formula">
                          <div className="sec-lbl">Formula</div>
                          <div className="formula-box">{t.formula}</div>
                        </div>
                      ) : null}

                      {t.example ? (
                        <div className="e-example">
                          <div className="sec-lbl">Worked Example</div>
                          <div className="example-box">{t.example}</div>
                        </div>
                      ) : null}

                      {t.see_also?.length ? (
                        <div>
                          <div className="sec-lbl">See Also</div>
                          <div className="see-also-row">
                            {t.see_also.map((sa) => (
                              <button
                                key={sa}
                                type="button"
                                className="sa-chip"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openTerm(sa, true);
                                }}
                              >
                                {sa}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <BrowserVoiceBar
                        text={termPlainText(t)}
                        title="Read term aloud"
                        className="dict-voice-bar"
                      />

                      <div className="card-actions">
                        {artHref ? (
                          <Link className="act-btn teal" href={artHref} onClick={(e) => e.stopPropagation()}>
                            📖 Article {t.article}
                          </Link>
                        ) : null}
                        {t.lesson ? (
                          <Link
                            className="act-btn teal"
                            href={lessonHref(t.lesson)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            🎓 Lesson {t.lesson}
                          </Link>
                        ) : null}
                        <span className={`xp-pill${xpDone ? " done" : ""}`}>
                          {xpDone ? "+5 XP ✓" : "+5 XP"}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
