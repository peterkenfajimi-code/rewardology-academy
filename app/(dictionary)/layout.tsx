import { ReactNode } from "react";
import { editorialSerif, editorialSans } from "@/lib/fonts";

export default function DictionaryLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`dict-layout ${editorialSerif.variable} ${editorialSans.variable}`}>
      {children}
    </div>
  );
}
