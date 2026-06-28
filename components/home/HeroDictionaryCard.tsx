"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DICTIONARY_TERMS } from "@/lib/dictionary/terms";
import { slugifyTerm, previewText } from "@/lib/dictionary/utils";

function getTodaysTerm() {
  // Uses the client's local calendar date so the term rotates at midnight local time,
  // independent of any server-side or CDN caching of the page.
  const now = new Date();
  const dayIndex =
    (now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate()) %
    DICTIONARY_TERMS.length;
  return DICTIONARY_TERMS[dayIndex];
}

export function HeroDictionaryCard() {
  const [term, setTerm] = useState(DICTIONARY_TERMS[0]);

  useEffect(() => {
    setTerm(getTodaysTerm());
  }, []);

  const href = `/dictionary#tc-${slugifyTerm(term.term)}`;
  const preview = previewText(term.definition, 155);

  return (
    <Link href={href} className="hero-card hero-dict-card">
      <div className="hero-dict-top" data-letter={term.term[0]}>
        <div className="challenge-eyebrow">
          <span className="challenge-dot" /> Term of the Day
        </div>
        <div className="hero-dict-term">
          {term.term}
          {term.abbr && <span className="hero-dict-abbr">{term.abbr}</span>}
        </div>
        <span className="hero-dict-cat">{term.cat}</span>
      </div>
      <div className="hero-dict-bottom">
        <p className="hero-dict-def">{preview}</p>
        <div className="hero-dict-cta">
          Explore the full dictionary <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}
