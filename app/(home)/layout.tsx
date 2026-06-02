import { ReactNode } from "react";
import { editorialSerif, editorialSans } from "@/lib/fonts";
import "@/styles/home.css";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`home-root ${editorialSerif.variable} ${editorialSans.variable}`}>
      {children}
    </div>
  );
}
