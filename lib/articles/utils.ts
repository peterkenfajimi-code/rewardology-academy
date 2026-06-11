import { editorialSerif, editorialSans } from "@/lib/fonts";
import type { EssentialArticle } from "@/lib/articles/essentials";

/** Shared editorial fonts — same as the rest of the site. */
export const essentialsSerif = editorialSerif;
export const essentialsSans = editorialSans;

/** Plain text for read-aloud and TTS. */
export function articlePlainText(article: EssentialArticle): string {
  const parts: string[] = [
    article.title,
    article.subtitle,
    article.intro,
  ];

  for (const section of article.sections) {
    parts.push(section.h2);
    parts.push(section.body);
    if (section.callout) {
      parts.push(section.callout.label);
      parts.push(section.callout.body);
    }
  }

  if (article.scenario) {
    parts.push(article.scenario.title);
    parts.push(article.scenario.body);
  }

  for (const mistake of article.mistakes) {
    parts.push(mistake.t);
    parts.push(mistake.d);
  }

  if (article.practical) {
    parts.push(article.practical.title);
    parts.push(...article.practical.steps);
  }

  parts.push(article.pullquote, article.closingNote, "Key takeaways.", ...article.takeaways);

  return parts.filter(Boolean).join("\n\n");
}

export function sectionParagraphs(body: string): string[] {
  return body.split(/\n\n+/).map((p) => p.trim()).filter(Boolean);
}
