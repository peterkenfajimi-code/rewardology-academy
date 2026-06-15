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

export function localDictionaryXpTotal(): number {
  return readDictionaryXp();
}

export function maxDictionaryXp(termCount: number, xpPerTerm: number): number {
  return termCount * xpPerTerm;
}

/** Award XP the first time a term is expanded. Returns XP earned (0 if already read). */
export function earnDictionaryTermXp(term: string, xpPerTerm: number): number {
  const set = readDictionaryReadSet();
  if (set.has(term)) return 0;
  set.add(term);
  writeDictionaryReadSet(set);
  const next = readDictionaryXp() + xpPerTerm;
  localStorage.setItem(XP_KEY, String(next));
  return xpPerTerm;
}
