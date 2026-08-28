import { BenefitsRepositoryProfile } from "@/components/repository/BenefitsRepositoryProfile";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const label = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${label} · Africa Benefits Repository`,
    description: "Published employer benefits profile from the Africa Benefits Repository.",
  };
}

export default async function BenefitsRepositoryCompanyPage({ params }: Props) {
  const { slug } = await params;
  return <BenefitsRepositoryProfile slug={slug} />;
}
