import { ReactNode } from "react";
import { RepositoryCommandPalette } from "@/components/repository/RepositoryCommandPalette";

export default function BenefitsRepositorySectionLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <RepositoryCommandPalette />
    </>
  );
}
