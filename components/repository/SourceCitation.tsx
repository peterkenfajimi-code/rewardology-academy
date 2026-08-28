"use client";

import { useState } from "react";

type Source = {
  source_type: string;
  source_title: string | null;
  source_url: string | null;
  publication_date: string | null;
};

export function SourceCitation({ source }: { source: Source }) {
  const [open, setOpen] = useState(false);
  const label = source.source_type.replace(/_/g, " ");

  return (
    <span className="benefits-repo-source-wrap">
      <button
        type="button"
        className="benefits-repo-source-trigger"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-expanded={open}
      >
        {label}
        {source.source_title ? ` — ${source.source_title}` : ""}
      </button>
      {open ? (
        <span className="benefits-repo-source-popover" role="tooltip">
          <strong>{source.source_title ?? label}</strong>
          <span>Type: {label}</span>
          {source.publication_date ? <span>Published: {source.publication_date}</span> : null}
          {source.source_url ? (
            <a href={source.source_url} target="_blank" rel="noopener noreferrer">
              Open source document
            </a>
          ) : null}
        </span>
      ) : null}
      {source.source_url ? (
        <>
          {" · "}
          <a href={source.source_url} target="_blank" rel="noopener noreferrer">
            link
          </a>
        </>
      ) : null}
    </span>
  );
}
