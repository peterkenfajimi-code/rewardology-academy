import { ReactNode } from "react";
import { editorialSans, editorialSerif } from "@/lib/fonts";
import "@/styles/repository-admin.css";

export default function RepositoryAdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`repo-admin-shell ${editorialSerif.variable} ${editorialSans.variable}`}>
      {children}
    </div>
  );
}

export const metadata = {
  title: "Repository Admin",
  robots: { index: false, follow: false },
};
