import { ESSENTIALS_ARTICLES, getEssentialById } from "@/lib/articles/essentials";
import { dispatchXpUpdated } from "@/lib/xp/dispatch";

export { dispatchXpUpdated };

/** Matches rewardology-articles-full.html localStorage key. */
export const ARTICLE_READ_STORAGE_KEY = "ra_read";

export type ArticleProgressMap = Record<number, { xp: number; slug: string; readAt?: string }>;

export function readLocalArticleIds(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ARTICLE_READ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number" && id > 0);
  } catch {
    return [];
  }
}

export function writeLocalArticleId(articleId: number) {
  if (typeof window === "undefined") return;
  const ids = new Set(readLocalArticleIds());
  ids.add(articleId);
  localStorage.setItem(ARTICLE_READ_STORAGE_KEY, JSON.stringify([...ids]));
}

export function localArticleXpTotal(): number {
  return readLocalArticleIds().reduce((sum, id) => sum + (getEssentialById(id)?.xp ?? 0), 0);
}

export function totalArticleXpFromMap(map: ArticleProgressMap): number {
  return Object.values(map).reduce((sum, row) => sum + (row.xp ?? 0), 0);
}

export function maxArticleXp(): number {
  return ESSENTIALS_ARTICLES.reduce((sum, a) => sum + a.xp, 0);
}
