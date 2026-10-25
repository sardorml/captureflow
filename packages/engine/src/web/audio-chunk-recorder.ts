/*
 * Mic-only Opus recorder that emits standalone WebM files of at most
 * `chunkMs`, each stamped with where it sits on the recording clock. A pause
 * closes the open chunk and resume opens a new one, so the chunks together
 * cover exactly the audio that is in the recording. Built for server-side
 * transcription: a speech model takes a whole file at a time, and short files
 * keep each call small.
 */

const AUDIO_MIME = "audio/webm;codecs=opus";
const AUDIO_BITRATE = 32_000;
const DEFAULT_CHUNK_MS = 120_000;

export type AudioChunk = {
  bytes: ArrayBuffer;
  startMs: number;
  endMs: number;
};

export type AudioChunkRecorderOptions = {
  track: MediaStreamTrack;
  // Recording time in ms with pauses removed, read when a chunk opens/closes.
  elapsedMs: () => number;
  onChunk: (chunk: AudioChunk) => void;
  chunkMs?: number;
  // Test seam; the default records `track` with the platform MediaRecorder.
  createRecorder?: (track: MediaStreamTrack) => ChunkMediaRecorder;
};

export type AudioChunkRecorder = {
  pause(): void;
  resume(): void;
  // Closes the open chunk and resolves once it has been delivered.
  stop(): Promise<void>;
  abort(): void;
};

// The slice of MediaRecorder this module drives.
export type ChunkMediaRecorder = {
  readonly state: "inactive" | "recording" | "paused";
  ondataavailable: ((event: BlobEvent) => void) | null;
  onstop: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
};

export function isAudioChunkRecordingSupported(): boolean {
  return (
    typeof MediaRecorder !== "undefined" &&
    MediaRecorder.isTypeSupported(AUDIO_MIME)
  );
}

function defaultCreateRecorder(track: MediaStreamTrack): ChunkMediaRecorder {
  return new MediaRecorder(new MediaStream([track]), {
    mimeType: AUDIO_MIME,
    audioBitsPerSecond: AUDIO_BITRATE,
  });
}

export function startAudioChunkRecorder(
  opts: AudioChunkRecorderOptions,
): AudioChunkRecorder {
  const chunkMs = opts.chunkMs ?? DEFAULT_CHUNK_MS;
  const createRecorder = opts.createRecorder ?? defaultCreateRecorder;

  let current: { recorder: ChunkMediaRecorder; startMs: number } | null = null;
  let rotateTimer: ReturnType<typeof setTimeout> | null = null;
  let closing: Promise<void>[] = [];
  let paused = false;
  let ended = false;

  // Each chunk gets its own MediaRecorder run: stop() is what makes the blob
  // a complete file with its own header.
  function open(): void {
    const recorder = createRecorder(opts.track);
    const startMs = opts.elapsedMs();
    const blobs: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) blobs.push(event.data);
    };
    recorder.start();
    current = { recorder, startMs };
    rotateTimer = setTimeout(() => {
      close();
      if (!ended && !paused) open();
    }, chunkMs);
  }

  function close(): void {
    if (!current) return;
    const { recorder, startMs } = current;
    current = null;
    if (rotateTimer) {
      clearTimeout(rotateTimer);
      rotateTimer = null;
    }
    const endMs = opts.elapsedMs();
    const blobs: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) blobs.push(event.data);
    };
    const delivered = new Promise<void>((resolve) => {
      recorder.onstop = () => {
        void (async () => {
          const bytes = await new Blob(blobs).arrayBuffer();
          if (bytes.byteLength > 0 && endMs > startMs) {
            opts.onChunk({ bytes, startMs, endMs });
          }
        })().finally(resolve);
      };
      if (recorder.state === "inactive") resolve();
      else recorder.stop();
    });
    closing.push(delivered);
  }

  open();

  return {
    pause() {
      if (ended || paused) return;
      paused = true;
      close();
    },
    resume() {
      if (ended || !paused) return;
      paused = false;
      open();
    },
    async stop() {
      if (ended) return;
      ended = true;
      close();
      await Promise.all(closing);
      closing = [];
    },
    abort() {
      ended = true;
      if (rotateTimer) clearTimeout(rotateTimer);
      if (current && current.recorder.state !== "inactive") {
        current.recorder.onstop = null;
        try {
          current.recorder.stop();
        } catch {
          /* ignore */
        }
      }
      current = null;
      closing = [];
    },
  };
}
