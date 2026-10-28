import { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { isPlatformAdminEmail } from "@/lib/auth/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import { createClient } from "@/lib/supabase/server";
import "@/styles/site.css";

export default async function PublicLayout({ children }: { children: ReactNode }) {
  let isAdmin = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAdmin = isPlatformAdminEmail(user?.email);
  }

  return (
    <div className={`site-root ${editorialSerif.variable} ${editorialSans.variable}`}>
      <SiteShell isAdmin={isAdmin}>{children}</SiteShell>
    </div>
  );
}
