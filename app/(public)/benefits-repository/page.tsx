import type { Metadata } from "next";
import { BenefitsRepositoryIndex } from "@/components/repository/BenefitsRepositoryIndex";
import { loadRepositoryCoverage } from "@/lib/repository/coverage";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const coverage = await loadRepositoryCoverage();
  const where = coverage?.countries.length ? ` across ${coverage.countries.join(", ")}` : " across Africa";
  return {
    title: "Africa Benefits Repository",
    description: `Research-backed catalog of employer benefits${where}.`,
  };
}

export default async function BenefitsRepositoryPage() {
  const coverage = await loadRepositoryCoverage();
  return <BenefitsRepositoryIndex marketCount={coverage?.countries.length ?? null} />;
}
