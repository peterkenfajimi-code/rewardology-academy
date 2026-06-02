import { notFound } from "next/navigation";
import {
  ESSENTIALS_ARTICLES,
  getEssentialBySlug,
} from "@/lib/articles/essentials";
import { essentialsSerif, essentialsSans } from "@/lib/articles/utils";
import { EssentialArticleView } from "@/components/articles/EssentialArticleView";
import "@/styles/essentials.css";

export function generateStaticParams() {
  return ESSENTIALS_ARTICLES.map((a) => ({ slug: a.slug }));
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const essential = getEssentialBySlug(slug);

  if (!essential) notFound();

  return (
    <div className={`${essentialsSerif.variable} ${essentialsSans.variable}`}>
      <EssentialArticleView article={essential} />
    </div>
  );
}
