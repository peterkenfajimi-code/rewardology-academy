"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

/** Renders a "Dashboard" nav link only when the user is signed in. */
export function DashboardNavLink({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading || !user) return null;

  const active = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  return (
    <Link href="/dashboard" className={`${className ?? ""} ${active ? "active" : ""}`.trim()}>
      Dashboard
    </Link>
  );
}
