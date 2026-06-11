/** Expand abbreviations and acronyms for clearer narration. */
const ABBREVIATIONS: Record<string, string> = {
  HR: "Human Resources",
  CEO: "C E O",
  CFO: "C F O",
  CHRO: "C H R O",
  COO: "C O O",
  EVP: "E V P",
  SVP: "S V P",
  VP: "V P",
  KPI: "K P I",
  OKR: "O K R",
  ROI: "R O I",
  TTRS: "total rewards",
  DEI: "D E I",
  ESG: "E S G",
  FLSA: "F L S A",
  FTE: "F T E",
  LTI: "long-term incentive",
  STI: "short-term incentive",
  RSU: "R S U",
  ESPP: "E S P P",
  COBRA: "Cobra",
  HSA: "H S A",
  FSA: "F S A",
  PTO: "P T O",
  OTE: "O T E",
};

function expandAbbreviations(text: string): string {
  let out = text;
  for (const [abbr, spoken] of Object.entries(ABBREVIATIONS)) {
    out = out.replace(new RegExp(`\\b${abbr}\\b`, "g"), spoken);
  }
  return out;
}

/**
 * Normalize article plain text for natural TTS.
 * @param ssmlBreaks When true, insert ElevenLabs SSML pause tags between sections.
 */
export function prepareTextForTts(raw: string, ssmlBreaks = false): string {
  const sections = raw
    .split(/\n\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const separator = ssmlBreaks ? ' <break time="0.85s" /> ' : " ";
  let text = sections.join(separator);

  text = text
    .replace(/[•·▪▸►–—]/g, ", ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?])\s*([A-Z])/g, "$1 $2")
    .replace(/\(\s*(\d+)\s*\)/g, ", $1,")
    .replace(/\s+/g, " ")
    .trim();

  text = expandAbbreviations(text);

  // Avoid run-on lists without pauses.
  text = text.replace(/:\s+/g, ": ");

  return text;
}
