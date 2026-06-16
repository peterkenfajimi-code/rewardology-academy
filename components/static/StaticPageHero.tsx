import { ReactNode } from "react";

type StaticPageHeroProps = {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  updated?: string;
};

export function StaticPageHero({ eyebrow, title, subtitle, updated }: StaticPageHeroProps) {
  return (
    <header className="sp-hero">
      <div className="sp-hero-mesh" aria-hidden />
      <p className="sp-eyebrow">{eyebrow}</p>
      <h1 className="sp-hero-title">{title}</h1>
      {subtitle ? <p className="sp-hero-sub">{subtitle}</p> : null}
      {updated ? <p className="sp-updated">{updated}</p> : null}
    </header>
  );
}
