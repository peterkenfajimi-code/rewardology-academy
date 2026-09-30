import { BenefitsRepositoryMethodology } from "@/components/repository/BenefitsRepositoryMethodology";

export const revalidate = 3600;

export const metadata = {
  title: "Methodology & About · Africa Benefits Repository",
  description:
    "Where the Africa Benefits Repository's data comes from, how the seven-source framework and confidence scoring work, and how conflicting disclosures are handled.",
};

export default function BenefitsRepositoryMethodologyPage() {
  return <BenefitsRepositoryMethodology />;
}
