"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { DICTIONARY_TERMS } from "@/lib/dictionary/terms";
import {
  dictionaryTermIndexForDate,
  previewText,
  slugifyTerm,
} from "@/lib/dictionary/utils";

function getTodaysTerm() {
  return DICTIONARY_TERMS[dictionaryTermIndexForDate(new Date(), DICTIONARY_TERMS.length)];
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
