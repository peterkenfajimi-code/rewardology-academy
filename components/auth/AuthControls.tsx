"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

function initialsFrom(name: string | undefined, email: string | undefined) {
  const source = (name && name.trim()) || (email ? email.split("@")[0] : "");
  if (!source) return "U";
  const parts = source.replace(/[._-]+/g, " ").trim().split(/\s+/);
  const letters = parts.slice(0, 2).map((p) => p[0] ?? "");
  return (letters.join("") || source[0] || "U").toUpperCase();
}

export function AuthControls() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const returnTo =
    !pathname || pathname === "/" || pathname.startsWith("/login") || pathname.startsWith("/signup")
      ? "/dashboard"
      : pathname;
  const loginHref = `/login?next=${encodeURIComponent(returnTo)}`;
  const signupHref = `/signup?next=${encodeURIComponent(returnTo)}`;

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  if (loading) {
    return <div className="ra-auth" style={{ width: 38, height: 38 }} aria-hidden />;
  }

  if (!user) {
    return (
      <div className="ra-auth ra-auth-actions">
        <Link href={loginHref} className="ra-auth-btn">
          Log in
        </Link>
        <Link href={signupHref} className="ra-auth-btn ra-auth-btn-primary">
          Join now
        </Link>
      </div>
    );
  }

  const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string };
  const displayName = meta.full_name || meta.name || user.email?.split("@")[0] || "Member";

  return (
    <div className="ra-auth ra-avatar-wrap" ref={wrapRef}>
      <button
        className="ra-avatar-btn"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={displayName}
      >
        {initialsFrom(meta.full_name || meta.name, user.email ?? undefined)}
      </button>

      {menuOpen && (
        <div className="ra-menu" role="menu">
          <div className="ra-menu-head">
            <div className="ra-menu-head-name">{displayName}</div>
            <div className="ra-menu-head-sub">{user.email}</div>
          </div>

          <Link href="/dashboard" className="ra-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
            <span className="ra-menu-item-icon">▦</span> Dashboard
          </Link>
          <Link href="/quizzes" className="ra-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
            <span className="ra-menu-item-icon">⚡</span> Quiz Centre &amp; XP
          </Link>
          <Link href="/courses" className="ra-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
            <span className="ra-menu-item-icon">◧</span> Courses
          </Link>
          <Link href="/articles" className="ra-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
            <span className="ra-menu-item-icon">◈</span> Articles
          </Link>

          <div className="ra-menu-sep" />

          <button
            className="ra-menu-item danger"
            role="menuitem"
            onClick={async () => {
              setMenuOpen(false);
              await signOut();
            }}
          >
            <span className="ra-menu-item-icon">⏻</span> Log out
          </button>
        </div>
      )}
    </div>
  );
}
