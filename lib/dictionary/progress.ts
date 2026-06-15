import { dispatchXpUpdated } from "@/lib/xp/dispatch";

const READ_KEY = "ra_dict_read";
const XP_KEY = "ra_dict_xp";

export function readDictionaryReadSet(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = JSON.parse(localStorage.getItem(READ_KEY) || "[]") as string[];
    return new Set(Array.isArray(raw) ? raw : []);
  } catch {
    return new Set();
  }
}

export function writeDictionaryReadSet(set: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...set]));
}

export function readDictionaryXp(): number {
  if (typeof window === "undefined") return 0;
  const n = parseInt(localStorage.getItem(XP_KEY) || "0", 10);
  return Number.isFinite(n) ? n : 0;
}

export function writeDictionaryXp(xp: number) {
  localStorage.setItem(XP_KEY, String(xp));
}

export function localDictionaryXpTotal(): number {
  return readDictionaryXp();
}

export function maxDictionaryXp(termCount: number, xpPerTerm: number): number {
  return termCount * xpPerTerm;
}

/** Merge server term list into local cache (used after sign-in sync). */
export function mergeDictionaryFromServer(terms: string[], dictionaryXp: number) {
  const set = readDictionaryReadSet();
  for (const t of terms) set.add(t);
  writeDictionaryReadSet(set);
  writeDictionaryXp(Math.max(readDictionaryXp(), dictionaryXp));
}

/** Award XP the first time a term is expanded. Returns XP earned (0 if already read). */
export function earnDictionaryTermXp(term: string, xpPerTerm: number): number {
  const set = readDictionaryReadSet();
  if (set.has(term)) return 0;
  set.add(term);
  writeDictionaryReadSet(set);
  const next = readDictionaryXp() + xpPerTerm;
  writeDictionaryXp(next);
  dispatchXpUpdated();
  return xpPerTerm;
}

/** Persist a term to the signed-in account (no-op if already saved server-side). */
export async function syncDictionaryTermToAccount(term: string, xpPerTerm: number) {
  try {
    const res = await fetch("/api/dictionary/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ term, xp: xpPerTerm }),
    });
    const data = (await res.json()) as {
      authenticated?: boolean;
      terms?: string[];
      dictionaryXp?: number;
    };
    if (res.ok && data.authenticated && data.terms) {
      mergeDictionaryFromServer(data.terms, data.dictionaryXp ?? readDictionaryXp());
      dispatchXpUpdated();
    }
  } catch {
    /* keep local result */
  }
}
