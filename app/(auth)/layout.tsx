import type { ReactNode } from "react";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import "@/styles/auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`ra-auth-root ${editorialSerif.variable} ${editorialSans.variable}`}>
      {children}
    </div>
  );
}
