import { ReactNode } from "react";
import { SiteShell } from "@/components/layout/SiteShell";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import "@/styles/site.css";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`site-root ${editorialSerif.variable} ${editorialSans.variable}`}>
      <SiteShell>{children}</SiteShell>
    </div>
  );
}
