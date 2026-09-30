"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { CompanyIndexRow } from "@/lib/repository/load-public-entries";
import { marketLabel } from "@/lib/repository/market-labels";

export function RepositoryCommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CompanyIndexRow[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setResults([]);
      setActive(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (!open || !term) {
      setResults([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      fetch(`/api/benefits-repository?q=${encodeURIComponent(term)}`)
        .then((r) => (r.ok ? r.json() : { companies: [] }))
        .then((data: { companies?: CompanyIndexRow[] }) => {
          if (cancelled) return;
          setResults((data.companies ?? []).slice(0, 8));
          setActive(0);
        })
        .catch(() => {
          if (!cancelled) setResults([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [q, open]);

  function go(company: CompanyIndexRow) {
    setOpen(false);
    router.push(`/benefits-repository/${company.slug}`);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  if (!open) return null;

  return (
    <div className="benefits-repo-palette-backdrop" onClick={() => setOpen(false)}>
      <div
        className="benefits-repo-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Search the repository"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onInputKey}
          placeholder="Search companies, benefits, fields…"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="benefits-repo-palette-list"
          aria-activedescendant={results[active] ? `palette-${results[active].company_id}` : undefined}
        />
        {results.length > 0 ? (
          <ul id="benefits-repo-palette-list" role="listbox">
            {results.map((c, i) => (
              <li
                key={c.company_id}
                id={`palette-${c.company_id}`}
                role="option"
                aria-selected={i === active}
                className={i === active ? "is-active" : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
              >
                <span>{c.name}</span>
                <span className="benefits-repo-muted">
                  {marketLabel(c.country)}
                  {c.industry ? ` · ${c.industry}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : q.trim() ? (
          <p className="benefits-repo-muted benefits-repo-palette-empty">No matching companies</p>
        ) : (
          <p className="benefits-repo-muted benefits-repo-palette-empty">
            Type to search · ↑↓ to move · Enter to open · Esc to close
          </p>
        )}
      </div>
    </div>
  );
}
