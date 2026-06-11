/** Natural-sounding browser voices, best first (from rewardology-articles-full.html). */
const VOICE_PRIORITY = [
  "Google UK English Female",
  "Google US English Female",
  "Microsoft Libby Online (Natural) - English (United Kingdom)",
  "Microsoft Mia Online (Natural) - English (United Kingdom)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Zira - English (United States)",
  "Samantha",
  "Karen",
  "Tessa",
  "Moira",
  "Victoria",
];

const FEMALE_HINTS =
  /female|libby|jenny|aria|zira|samantha|karen|tessa|moira|fiona|natasha|victoria|hazel|susan|mia|emma|sonia/i;

export function pickBrowserVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices.length) return null;

  for (const name of VOICE_PRIORITY) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }

  const female = voices.find((v) => FEMALE_HINTS.test(v.name));
  if (female) return female;

  return voices.find((v) => v.lang.startsWith("en")) ?? voices[0] ?? null;
}

export function loadBrowserVoices(): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return Promise.resolve([]);
  }

  const existing = window.speechSynthesis.getVoices();
  if (existing.length) return Promise.resolve(existing);

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => {
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    }, 1200);

    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timeout);
      window.speechSynthesis.onvoiceschanged = null;
      resolve(window.speechSynthesis.getVoices());
    };
  });
}
