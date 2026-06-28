/**
 * Platform sound effects — generated via the Web Audio API (no audio files needed).
 * All functions are safe to call from any client component; they silently no-op in
 * unsupported environments or when the user's browser blocks autoplay.
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) _ctx = new AudioContext();
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

/** Play a single sine-wave note with a smooth attack and exponential decay. */
function note(
  ac: AudioContext,
  hz: number,
  start: number,
  duration: number,
  volume = 0.25,
  wave: OscillatorType = "sine"
): void {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  osc.type = wave;
  osc.frequency.setValueAtTime(hz, start);

  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/**
 * Lesson complete chime — a bright three-note ascending arpeggio (C–E–G).
 * Short, pleasant, non-intrusive.
 */
export function playLessonComplete(): void {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;
  note(ac, 523.25, t,        0.35); // C5
  note(ac, 659.25, t + 0.10, 0.35); // E5
  note(ac, 783.99, t + 0.20, 0.55); // G5 — held a touch longer
}

/**
 * Course complete fanfare — a full triumphant chord with a rising sweep.
 * More elaborate to mark the achievement.
 */
export function playCourseComplete(): void {
  const ac = ctx();
  if (!ac) return;
  const t = ac.currentTime;

  // Rising arpeggio sweep
  note(ac, 392.00, t,        0.30, 0.20); // G4
  note(ac, 523.25, t + 0.12, 0.30, 0.22); // C5
  note(ac, 659.25, t + 0.24, 0.30, 0.24); // E5
  note(ac, 783.99, t + 0.36, 0.30, 0.26); // G5

  // Final triumphant chord (C major, all voices together)
  note(ac, 1046.50, t + 0.52, 1.20, 0.28); // C6 — melody top note
  note(ac, 783.99,  t + 0.52, 1.20, 0.18); // G5 — harmony
  note(ac, 659.25,  t + 0.52, 1.20, 0.14); // E5 — harmony
  note(ac, 523.25,  t + 0.52, 1.20, 0.12); // C5 — bass
}
