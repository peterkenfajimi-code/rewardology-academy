import type { Metadata } from "next";
import { BenefitsRepositoryProfile } from "@/components/repository/BenefitsRepositoryProfile";
import { isRepositorySupabaseConfigured } from "@/lib/env";
import { findCompanyBySlug, loadPublicBenefitEntries } from "@/lib/repository/load-public-entries";
import { marketLabel } from "@/lib/repository/market-labels";

type Props = {
  params: Promise<{ slug: string }>;
};

async function companyForSlug(slug: string) {
  if (!isRepositorySupabaseConfigured()) return null;
  try {
    const { entries } = await loadPublicBenefitEntries();
    return findCompanyBySlug(entries, slug)?.company ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await companyForSlug(slug);
  if (!company) {
    return { title: "Company profile · Africa Benefits Repository" };
  }
  return {
    title: `${company.name} · Africa Benefits Repository`,
    description: `Published employer benefits for ${company.name} (${marketLabel(company.country)}), with confidence levels and source citations.`,
  };
}

export default async function BenefitsRepositoryCompanyPage({ params }: Props) {
  const { slug } = await params;
  return <BenefitsRepositoryProfile slug={slug} />;
}
