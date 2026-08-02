import { COMIC_ISSUES } from "@/lib/comics/comicData";
import { dispatchXpUpdated } from "@/lib/xp/dispatch";

/** Matches dashboard prototype — 25 XP per comic issue, awarded once. */
export const COMIC_XP_PER_ISSUE = 25;

/** Matches dashboard prototype localStorage key. */
export const COMICS_READ_STORAGE_KEY = "ra_comics_read";

const VALID_COMIC_SLUGS = new Set(
  COMIC_ISSUES.filter((issue) => issue.available).map((issue) => issue.slug)
);

export function isValidComicSlug(slug: string): boolean {
  return VALID_COMIC_SLUGS.has(slug);
}

export function filterValidComicSlugs(slugs: Iterable<string>): string[] {
  return [...new Set(slugs)].filter(isValidComicSlug);
}

export function comicsXpForSlugs(slugs: Iterable<string>): number {
  return filterValidComicSlugs(slugs).length * COMIC_XP_PER_ISSUE;
}

function persistComicsReadSet(set: Set<string>) {
  const valid = new Set(filterValidComicSlugs(set));
  localStorage.setItem(COMICS_READ_STORAGE_KEY, JSON.stringify([...valid]));
  return valid;
}

export function readComicsReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(COMICS_READ_STORAGE_KEY) || "[]") as string[];
    const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
    const valid = filterValidComicSlugs(list);
    if (valid.length !== list.length) {
      localStorage.setItem(COMICS_READ_STORAGE_KEY, JSON.stringify(valid));
    }
    return new Set(valid);
  } catch {
    return new Set();
  }
}

export function writeComicsReadSet(set: Set<string>) {
  persistComicsReadSet(set);
}

export function localComicsXpTotal(): number {
  return readComicsReadSet().size * COMIC_XP_PER_ISSUE;
}

export function mergeComicsFromServer(slugs: string[]) {
  const merged = new Set([...readComicsReadSet(), ...filterValidComicSlugs(slugs)]);
  writeComicsReadSet(merged);
}

/** Award XP the first time an issue is read. Returns XP earned (0 if already read). */
export function earnComicIssueXp(slug: string): number {
  if (!isValidComicSlug(slug)) return 0;
  const set = readComicsReadSet();
  if (set.has(slug)) return 0;
  set.add(slug);
  writeComicsReadSet(set);
  dispatchXpUpdated();
  return COMIC_XP_PER_ISSUE;
}

export async function syncComicIssueToAccount(slug: string, issueNumber: number) {
  if (!isValidComicSlug(slug)) return;

  try {
    const res = await fetch("/api/comics/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, issueNumber, xp: COMIC_XP_PER_ISSUE }),
    });
    const data = (await res.json()) as {
      authenticated?: boolean;
      slugs?: string[];
      comicsXp?: number;
    };
    if (res.ok && data.authenticated && data.slugs) {
      mergeComicsFromServer(data.slugs);
      dispatchXpUpdated();
    }
  } catch {
    /* keep local result */
  }
}

export function filterComicsProgressRows<T extends { slug: string; xp?: number }>(
  rows: T[] | null | undefined
): T[] {
  return (rows ?? []).filter((row) => isValidComicSlug(row.slug));
}

export function comicsXpFromRows(rows: { slug: string; xp?: number }[] | null | undefined): number {
  return filterComicsProgressRows(rows).reduce((sum, row) => sum + (row.xp ?? COMIC_XP_PER_ISSUE), 0);
}
