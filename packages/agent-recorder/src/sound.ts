import { KEY_HIT_RATE, KEY_HITS } from "./key-hits";
import { CHANNELS, SAMPLE_RATE } from "./pacing";
import { mulberry32 } from "./random";

export type SoundLayer = { pcm: Int16Array; atMs: number };

type Strike = {
  at: number;
  gain: number;
  noiseMs: number;
  toneHz: number;
  toneMs: number;
  thockGain: number;
};

const KEY_TAIL_MS = 90;
const MOUSE_RELEASE_MS = 90;

const hits = KEY_HITS.map((b64) => {
  const bytes = new Uint8Array(Buffer.from(b64, "base64"));
  return new Int16Array(bytes.buffer);
});

// A recorded keystroke, played a little faster or slower each time so a run of keys never repeats.
function tap(
  out: Float32Array,
  atMs: number,
  hit: Int16Array,
  rate: number,
  gain: number,
) {
  const start = Math.round((atMs / 1000) * SAMPLE_RATE);
  const step = (KEY_HIT_RATE / SAMPLE_RATE) * rate;
  for (let i = 0; start + i < out.length; i++) {
    const pos = i * step;
    const j = Math.floor(pos);
    if (j + 1 >= hit.length) break;
    const frac = pos - j;
    const v = (hit[j]! * (1 - frac) + hit[j + 1]! * frac) / 32768;
    out[start + i] = out[start + i]! + v * gain;
  }
}

/*
 * The mouse click is a short burst of noise, a ringing tone and a low thock
 * from the desk, one on the press and a lighter one on the release.
 */
function strike(out: Float32Array, s: Strike) {
  const start = Math.round((s.at / 1000) * SAMPLE_RATE);
  const rng = mulberry32(start);
  const noiseTau = (s.noiseMs / 1000) * SAMPLE_RATE;
  const toneTau = (s.toneMs / 1000) * SAMPLE_RATE;
  const thockTau = 0.012 * SAMPLE_RATE;
  const length = Math.round(((s.noiseMs + s.toneMs) / 1000) * SAMPLE_RATE * 4);
  for (let i = 0; i < length && start + i < out.length; i++) {
    const noise = (rng() * 2 - 1) * Math.exp(-i / noiseTau);
    const tone =
      Math.sin((2 * Math.PI * s.toneHz * i) / SAMPLE_RATE) *
      Math.exp(-i / toneTau) *
      0.6;
    const thock =
      Math.sin((2 * Math.PI * 170 * i) / SAMPLE_RATE) *
      Math.exp(-i / thockTau) *
      s.thockGain;
    out[start + i] = out[start + i]! + (noise + tone + thock) * s.gain;
  }
}

// Keystrokes at the prompt's moments, a mouse press and release on send; mono, as a stereo bed.
export function typingSound(
  prompt: { text: string; at: number[]; sendAt: number },
  seed: number,
): Int16Array {
  const rng = mulberry32(seed);
  const lengthMs = prompt.sendAt + MOUSE_RELEASE_MS + KEY_TAIL_MS * 2;
  const mono = new Float32Array(Math.round((lengthMs / 1000) * SAMPLE_RATE));
  prompt.at.forEach((at, i) => {
    const space = prompt.text[i] === " ";
    tap(
      mono,
      at,
      hits[Math.floor(rng() * hits.length)]!,
      (space ? 0.88 : 0.94) + rng() * 0.12,
      (0.35 + rng() * 0.2) * (space ? 1.15 : 1),
    );
  });
  strike(mono, {
    at: prompt.sendAt,
    gain: 0.3,
    noiseMs: 3,
    toneHz: 3200,
    toneMs: 5,
    thockGain: 0.4,
  });
  strike(mono, {
    at: prompt.sendAt + MOUSE_RELEASE_MS,
    gain: 0.18,
    noiseMs: 2.5,
    toneHz: 3600,
    toneMs: 4,
    thockGain: 0.2,
  });
  const out = new Int16Array(mono.length * CHANNELS);
  for (let i = 0; i < mono.length; i++) {
    const v = Math.round(Math.max(-1, Math.min(1, mono[i]!)) * 32767);
    for (let c = 0; c < CHANNELS; c++) out[i * CHANNELS + c] = v;
  }
  return out;
}

// One bed from several sounds, each placed at its moment; the sum never clips.
export function layerSounds(layers: SoundLayer[]): Int16Array {
  const end = Math.max(
    0,
    ...layers.map(
      (l) =>
        Math.round((l.atMs / 1000) * SAMPLE_RATE) * CHANNELS + l.pcm.length,
    ),
  );
  const out = new Int16Array(end);
  for (const l of layers) {
    const offset = Math.round((l.atMs / 1000) * SAMPLE_RATE) * CHANNELS;
    for (let i = 0; i < l.pcm.length; i++) {
      out[offset + i] = Math.max(
        -32768,
        Math.min(32767, out[offset + i]! + l.pcm[i]!),
      );
    }
  }
  return out;
}
