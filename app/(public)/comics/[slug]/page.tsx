import { notFound } from "next/navigation";
import { ComicIssueView } from "@/components/comics/ComicIssueView";
import {
  COMIC_ISSUES,
  getComicBySlug,
} from "@/lib/comics/comicData";
import "@/styles/comics.css";

export function generateStaticParams() {
  return COMIC_ISSUES.map((issue) => ({ slug: issue.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getComicBySlug(slug);
  if (!issue) return { title: "Comic Not Found" };

  return {
    title: `Issue #${issue.number}: ${issue.title} — Rewardology Academy`,
    description: issue.description,
  };
}

export default async function ComicIssuePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const issue = getComicBySlug(slug);

  if (!issue) notFound();

  return <ComicIssueView issue={issue} />;
}
