"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuth, type AuthMode } from "@/components/auth/AuthProvider";
import { safeNextPath } from "@/lib/auth/routes";

type Props = {
  mode: AuthMode;
  next?: string;
};

export function AuthGate({ mode, next }: Props) {
  const router = useRouter();
  const { user, loading, supabase, configured } = useAuth();
  const nextPath = safeNextPath(next);

  const nextQuery = next ? `?next=${encodeURIComponent(nextPath)}` : "";
  const switchHref =
    mode === "login" ? `/signup${nextQuery}` : `/login${nextQuery}`;

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, user, nextPath, router]);

  if (loading || user) {
    return (
      <div className="ra-auth ra-auth-page">
        <div className="ra-auth-page-inner ra-auth-page-loading">Loading…</div>
      </div>
    );
  }

  return (
    <div className="ra-auth ra-auth-page">
      <div className="ra-auth-page-inner">
        <Link href="/" className="ra-auth-back">
          ← Back to home
        </Link>
        <div className="ra-modal ra-auth-card">
          <AuthForm
            mode={mode}
            switchHref={switchHref}
            supabase={supabase}
            configured={configured}
            nextPath={nextPath}
            onSuccess={() => router.push(nextPath)}
          />
        </div>
        <p className="ra-auth-public-note">
          Articles on the homepage are free to browse without an account.
        </p>
      </div>
    </div>
  );
}
