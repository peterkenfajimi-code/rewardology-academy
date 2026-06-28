/**
 * Platform sound effects — synthesised via the Web Audio API.
 * No audio files required. All functions silently no-op in unsupported environments.
 *
 * Techniques used:
 *  - Marimba/bell model: sine fundamental + overtones with faster individual decays
 *  - Brass model: sawtooth oscillator through a sweeping low-pass filter
 *  - Convolution reverb: synthetic impulse response for natural room decay
 *  - Stereo panning for spatial width
 */

// ── Shared audio context + nodes ─────────────────────────────────────────────

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _reverb: ConvolverNode | null = null;
let _dry: GainNode | null = null;
let _wet: GainNode | null = null;

/** Create a synthetic reverb impulse (approximates a small concert hall). */
function buildReverb(ac: AudioContext): ConvolverNode {
  const sampleRate = ac.sampleRate;
  const duration = 2.2; // seconds
  const len = Math.floor(sampleRate * duration);
  const impulse = ac.createBuffer(2, len, sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      // Exponential decay with some early reflections
      const decay = Math.pow(1 - i / len, 2.8);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
  }
  const node = ac.createConvolver();
  node.buffer = impulse;
  return node;
}

function setup(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!_ctx) {
      _ctx = new AudioContext();

      _master = _ctx.createGain();
      _master.gain.value = 0.85;
      _master.connect(_ctx.destination);

      _reverb = buildReverb(_ctx);

      _wet = _ctx.createGain();
      _wet.gain.value = 0.28; // reverb mix

      _dry = _ctx.createGain();
      _dry.gain.value = 1.0;

      _reverb.connect(_wet);
      _wet.connect(_master);
      _dry.connect(_master);
    }
    if (_ctx.state === "suspended") _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

// ── Low-level helpers ─────────────────────────────────────────────────────────

/** Route a node to both dry and reverb-wet outputs. */
function route(node: AudioNode): void {
  if (_dry) node.connect(_dry);
  if (_reverb) node.connect(_reverb);
}

/**
 * Marimba/bell note model: sine fundamental + 2nd and 4th harmonics
 * that decay more quickly, giving the characteristic hollow-bright timbre.
 */
function bellNote(
  ac: AudioContext,
  hz: number,
  start: number,
  sustain: number,
  vol = 0.22,
  pan = 0
): void {
  const panner = ac.createStereoPanner();
  panner.pan.setValueAtTime(pan, start);
  route(panner);

  // Fundamental — longest decay
  const osc1 = ac.createOscillator();
  const g1 = ac.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(hz, start);
  g1.gain.setValueAtTime(0, start);
  g1.gain.linearRampToValueAtTime(vol, start + 0.008);
  g1.gain.exponentialRampToValueAtTime(0.0001, start + sustain);
  osc1.connect(g1); g1.connect(panner);
  osc1.start(start); osc1.stop(start + sustain + 0.05);

  // 2nd harmonic — decays ~2× faster
  const osc2 = ac.createOscillator();
  const g2 = ac.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(hz * 2.756, start); // slightly inharmonic (marimba character)
  g2.gain.setValueAtTime(0, start);
  g2.gain.linearRampToValueAtTime(vol * 0.45, start + 0.006);
  g2.gain.exponentialRampToValueAtTime(0.0001, start + sustain * 0.45);
  osc2.connect(g2); g2.connect(panner);
  osc2.start(start); osc2.stop(start + sustain * 0.5);

  // 4th harmonic — very short, adds the initial "knock"
  const osc3 = ac.createOscillator();
  const g3 = ac.createGain();
  osc3.type = "sine";
  osc3.frequency.setValueAtTime(hz * 5.404, start);
  g3.gain.setValueAtTime(0, start);
  g3.gain.linearRampToValueAtTime(vol * 0.2, start + 0.004);
  g3.gain.exponentialRampToValueAtTime(0.0001, start + sustain * 0.18);
  osc3.connect(g3); g3.connect(panner);
  osc3.start(start); osc3.stop(start + sustain * 0.22);
}

/**
 * Brass note model: sawtooth through a sweeping low-pass filter.
 * Gives the characteristic bright attack → warm body of a trumpet/horn.
 */
function brassNote(
  ac: AudioContext,
  hz: number,
  start: number,
  duration: number,
  vol = 0.18,
  pan = 0
): void {
  const panner = ac.createStereoPanner();
  panner.pan.setValueAtTime(pan, start);
  route(panner);

  const osc = ac.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(hz, start);
  // Slight pitch vibrato after attack
  osc.frequency.setValueAtTime(hz, start + 0.12);
  osc.frequency.linearRampToValueAtTime(hz * 1.002, start + 0.35);

  // Low-pass filter sweeps from bright to warm
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.Q.value = 2.5;
  filter.frequency.setValueAtTime(800, start);
  filter.frequency.linearRampToValueAtTime(2600, start + 0.06); // bright attack
  filter.frequency.exponentialRampToValueAtTime(1100, start + duration * 0.6); // warm body

  // Amplitude envelope: ADSR
  const gain = ac.createGain();
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.055); // attack
  gain.gain.linearRampToValueAtTime(vol * 0.82, start + 0.15); // decay
  gain.gain.setValueAtTime(vol * 0.82, start + duration - 0.12); // sustain
  gain.gain.linearRampToValueAtTime(0, start + duration); // release

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(panner);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Lesson complete — warm marimba arpeggio (C–E–G–C), ascending with a slight
 * stereo spread. Short, bright, rewarding.
 */
export function playLessonComplete(): void {
  const ac = setup();
  if (!ac) return;
  try {
    const t = ac.currentTime;
    // C5–E5–G5–C6 ascending arpeggio, panned slightly L→R
    bellNote(ac, 523.25, t,        0.70, 0.24, -0.3); // C5
    bellNote(ac, 659.25, t + 0.11, 0.70, 0.26, -0.1); // E5
    bellNote(ac, 783.99, t + 0.22, 0.75, 0.28,  0.1); // G5
    bellNote(ac, 1046.5, t + 0.33, 0.95, 0.30,  0.3); // C6 — top, held longer
  } catch { /* ignore */ }
}

/**
 * Course complete fanfare — a two-phase orchestral moment:
 *   Phase 1: rising brass arpeggio sweep (4 notes)
 *   Phase 2: full brass chord (4 voices + bell overtone sparkle on top)
 * Rich, triumphant, celebratory.
 */
export function playCourseComplete(): void {
  const ac = setup();
  if (!ac) return;
  try {
    const t = ac.currentTime;

    // ── Phase 1: Rising brass arpeggio ──
    brassNote(ac, 392.00, t,        0.28, 0.16, -0.5); // G4  — left
    brassNote(ac, 523.25, t + 0.14, 0.28, 0.18, -0.2); // C5
    brassNote(ac, 659.25, t + 0.28, 0.28, 0.20,  0.2); // E5
    brassNote(ac, 783.99, t + 0.42, 0.30, 0.22,  0.5); // G5  — right

    // ── Phase 2: Full triumphant chord (starts at t + 0.62) ──
    const chord = t + 0.62;

    // Bass voice
    brassNote(ac, 261.63, chord, 2.0, 0.20, -0.4); // C4
    // Mid voices
    brassNote(ac, 392.00, chord, 2.0, 0.18, -0.2); // G4
    brassNote(ac, 523.25, chord, 2.0, 0.20,  0.0); // C5
    brassNote(ac, 659.25, chord, 2.0, 0.18,  0.2); // E5
    // Melody top note — slightly delayed for a cascading feel
    brassNote(ac, 783.99, chord + 0.04, 2.0, 0.22,  0.4); // G5

    // Bell sparkle on top of the chord for shimmer
    bellNote(ac, 1046.5, chord,        1.4, 0.18,  0.0); // C6
    bellNote(ac, 1318.5, chord + 0.08, 1.2, 0.12,  0.3); // E6 shimmer
    bellNote(ac, 1567.9, chord + 0.16, 1.0, 0.08,  0.5); // G6 sparkle
  } catch { /* ignore */ }
}
