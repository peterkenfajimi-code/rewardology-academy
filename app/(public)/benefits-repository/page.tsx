import { BenefitsRepositoryBrowser } from "@/components/repository/BenefitsRepositoryBrowser";

export const metadata = {
  title: "Africa Benefits Repository",
  description:
    "Research-backed catalog of employer benefits across Nigeria, Ghana, Kenya, South Africa, Egypt, and Rwanda.",
};

export default function BenefitsRepositoryPage() {
  return <BenefitsRepositoryBrowser />;
}
