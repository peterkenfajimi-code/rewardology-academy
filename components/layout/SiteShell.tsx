"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { AuthControls } from "@/components/auth/AuthControls";
import { DAILY_QUIZ_HREF } from "@/lib/site";

const nav = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/courses", label: "Courses" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/comics", label: "Comics" },
];

const footerLinks = [
  { href: "/articles", label: "Articles" },
  { href: "/courses", label: "Courses" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/comics", label: "Comics" },
  { href: "/setup", label: "Integration status" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header>
        <nav className="site-nav">
          <Link href="/" className="site-brand">
            <span className="site-brand-mark">R</span>
            Rewardology Academy
          </Link>

          <ul className="site-nav-links">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={isActive(pathname, item.href) ? "active" : ""}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href={DAILY_QUIZ_HREF} className="site-nav-cta">
                Take today&apos;s quiz
              </Link>
            </li>
            <li>
              <AuthControls />
            </li>
          </ul>

          <button
            className="site-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            Menu
          </button>
        </nav>

        <div className={`site-mobile-nav${menuOpen ? " open" : ""}`}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href={DAILY_QUIZ_HREF} onClick={() => setMenuOpen(false)}>
            Take today&apos;s quiz →
          </Link>
          <div style={{ paddingTop: 12 }}>
            <AuthControls />
          </div>
        </div>
      </header>

      <main className="site-main">{children}</main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <div>
            <div className="site-footer-brand">Rewardology Academy</div>
            <div className="site-footer-tag">Total Rewards learning platform · © 2026</div>
          </div>
          <div className="site-footer-links">
            {footerLinks.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}
