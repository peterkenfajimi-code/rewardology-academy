import { dispatchXpUpdated } from "@/lib/xp/dispatch";

/** Matches dashboard prototype — 25 XP per comic issue, awarded once. */
export const COMIC_XP_PER_ISSUE = 25;

/** Matches dashboard prototype localStorage key. */
export const COMICS_READ_STORAGE_KEY = "ra_comics_read";

export function readComicsReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(COMICS_READ_STORAGE_KEY) || "[]") as string[];
    return new Set(Array.isArray(raw) ? raw.filter(Boolean) : []);
  } catch {
    return new Set();
  }
}

export function writeComicsReadSet(set: Set<string>) {
  localStorage.setItem(COMICS_READ_STORAGE_KEY, JSON.stringify([...set]));
}

export function localComicsXpTotal(): number {
  return readComicsReadSet().size * COMIC_XP_PER_ISSUE;
}

export function mergeComicsFromServer(slugs: string[]) {
  const set = readComicsReadSet();
  for (const slug of slugs) set.add(slug);
  writeComicsReadSet(set);
}

/** Award XP the first time an issue is read. Returns XP earned (0 if already read). */
export function earnComicIssueXp(slug: string): number {
  const set = readComicsReadSet();
  if (set.has(slug)) return 0;
  set.add(slug);
  writeComicsReadSet(set);
  dispatchXpUpdated();
  return COMIC_XP_PER_ISSUE;
}

export async function syncComicIssueToAccount(slug: string, issueNumber: number) {
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
