import { editorialSerif, editorialSans } from "@/lib/fonts";

/** Shared editorial fonts — same as the rest of the site. */
export const essentialsSerif = editorialSerif;
export const essentialsSans = editorialSans;

export function articlePlainText(article: {
  title: string;
  subtitle: string;
  paragraphs: string[];
  pullquote: string;
  takeaways: string[];
}): string {
  return [
    article.title,
    article.subtitle,
    ...article.paragraphs,
    article.pullquote,
    "Key takeaways.",
    ...article.takeaways,
  ]
    .filter(Boolean)
    .join("\n\n");
}
