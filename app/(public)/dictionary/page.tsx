import { DictionaryCentre } from "@/components/dictionary/DictionaryCentre";
import { DICTIONARY_TERM_COUNT } from "@/lib/dictionary/terms";

export const metadata = {
  title: "Total Rewards Dictionary — Rewardology Academy",
  description: `The most comprehensive Total Rewards dictionary — ${DICTIONARY_TERM_COUNT} practitioner-depth entries across 12 disciplines. Free, searchable, cross-linked.`,
};

export default function DictionaryPage() {
  return <DictionaryCentre />;
}
