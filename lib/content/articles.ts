import { isSanityConfigured, sanity } from "@/lib/sanity/client";
import { ARTICLE_BY_SLUG_QUERY, ARTICLES_QUERY } from "@/lib/sanity/queries";
import { demoArticles } from "@/lib/sanity/demoContent";

export type ArticleListItem = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
};

export type ArticleDetail = ArticleListItem & {
  body?: Array<{
    _type?: string;
    children?: Array<{ _type?: string; text?: string }>;
  }>;
};

export async function getArticles(): Promise<ArticleListItem[]> {
  if (!isSanityConfigured) return demoArticles;

  try {
    return await sanity.fetch<ArticleListItem[]>(ARTICLES_QUERY);
  } catch {
    return demoArticles;
  }
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  if (!isSanityConfigured) {
    return demoArticles.find((a) => a.slug === slug) ?? null;
  }

  try {
    return await sanity.fetch<ArticleDetail | null>(ARTICLE_BY_SLUG_QUERY, { slug });
  } catch {
    return demoArticles.find((a) => a.slug === slug) ?? null;
  }
}
