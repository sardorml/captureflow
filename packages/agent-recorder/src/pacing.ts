export const FPS = 30;
export const SAMPLE_RATE = 48_000;
export const CHANNELS = 2;
export const BYTES_PER_SAMPLE = 2;

/*
 * ffmpeg stamps piped frames and samples by count, so the feed has to match
 * wall-clock time exactly: each tick writes however many frames and samples
 * are due since the start, repeating the last frame when the page hasn't
 * changed. A late tick catches up instead of drifting. Paused time is left
 * out, so the recording jumps straight to whatever comes after it.
 */
export function createPacer(startMs: number) {
  let framesWritten = 0;
  let samplesWritten = 0;
  let pausedAt: number | null = null;
  return {
    pause(nowMs: number) {
      pausedAt ??= nowMs;
    },
    resume(nowMs: number) {
      if (pausedAt === null) return;
      startMs += nowMs - pausedAt;
      pausedAt = null;
    },
    due(nowMs: number): { frames: number; samples: number } {
      if (pausedAt !== null) return { frames: 0, samples: 0 };
      const elapsed = Math.max(0, nowMs - startMs) / 1000;
      const frames = Math.floor(elapsed * FPS) - framesWritten;
      const samples = Math.floor(elapsed * SAMPLE_RATE) - samplesWritten;
      framesWritten += frames;
      samplesWritten += samples;
      return { frames, samples };
    },
    get durationMs() {
      return Math.round((framesWritten / FPS) * 1000);
    },
  };
}

// The page's own sound runs live; a backlog past this is dropped so it stays in sync with the picture.
const MAX_LIVE_BACKLOG = Math.round(SAMPLE_RATE * 0.5) * CHANNELS;
// It arrives in bursts; holding this much back first rides out the gaps between them.
const LIVE_PREBUFFER = Math.round(SAMPLE_RATE * 0.2) * CHANNELS;

/*
 * Interleaved 16-bit stereo for the recording's audio track: queued clips
 * (the narration) are played in order over the page's live sound, and
 * silence fills the rest. A clip's promise resolves once its last sample
 * has gone out.
 */
export function createAudioMixer() {
  type Clip = { pcm: Int16Array; at: number; done: () => void };
  const queue: Clip[] = [];
  let live: Int16Array[] = [];
  let liveLength = 0;
  let primed = false;
  function takeLive(out: Int16Array) {
    if (!primed && liveLength < LIVE_PREBUFFER) return;
    primed = liveLength > 0;
    let at = 0;
    while (at < out.length && live.length > 0) {
      const chunk = live[0]!;
      const n = Math.min(out.length - at, chunk.length);
      for (let i = 0; i < n; i++) {
        out[at + i] = Math.max(
          -32768,
          Math.min(32767, out[at + i]! + chunk[i]!),
        );
      }
      at += n;
      liveLength -= n;
      if (n === chunk.length) live.shift();
      else live[0] = chunk.subarray(n);
    }
  }
  return {
    play(pcm: Int16Array): Promise<void> {
      return new Promise((done) => queue.push({ pcm, at: 0, done }));
    },
    feed(pcm: Int16Array) {
      live.push(pcm);
      liveLength += pcm.length;
      while (liveLength > MAX_LIVE_BACKLOG && live.length > 1) {
        liveLength -= live.shift()!.length;
      }
    },
    // Keeps the newest moment of sound across a pause, so it picks up without a gap.
    holdLive() {
      while (liveLength > LIVE_PREBUFFER && live.length > 1) {
        liveLength -= live.shift()!.length;
      }
    },
    take(samples: number): Buffer {
      const out = new Int16Array(samples * CHANNELS);
      let filled = 0;
      while (filled < out.length && queue.length > 0) {
        const clip = queue[0]!;
        const n = Math.min(out.length - filled, clip.pcm.length - clip.at);
        out.set(clip.pcm.subarray(clip.at, clip.at + n), filled);
        filled += n;
        clip.at += n;
        if (clip.at >= clip.pcm.length) {
          queue.shift();
          clip.done();
        }
      }
      takeLive(out);
      return Buffer.from(out.buffer, out.byteOffset, out.byteLength);
    },
    get playing() {
      return queue.length > 0;
    },
  };
}
