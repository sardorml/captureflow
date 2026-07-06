import type { RecordingFrameEvent } from "../types";
import { createFmp4Muxer, type Fmp4Muxer } from "./fmp4-mux";
import { decodePosterJpeg } from "./poster";

const AUDIO_FORMAT_WAIT_MS = 1000;
const DEFAULT_CAP_SLACK_MS = 2_000;

// Matches the native VTCompressionSession output (Baseline 3.2).
const NATIVE_RECORD_CODEC = "avc1.42E020";

export type RecordPipelineLog = {
  info(message: string): void;
  warn(message: string): void;
};

export type RecordPipelineIO = {
  /** Subscribe to the native record events; called once from attach(). */
  frameEvents(cb: (event: RecordingFrameEvent) => void): void;
  /** Receives muxed fMP4 bytes as they are written (the upload feed). */
  output(bytes: Uint8Array, position: number): void;
  log?: RecordPipelineLog;
  capMs?: number;
  capSlackMs?: number;
};

export type RecordPipelineResult = {
  /** Total muxed bytes shipped through `output`. */
  sizeBytes: number;
  /** Muxed video duration in milliseconds (pause-adjusted). */
  durationMs: number;
  encodedFrames: number;
  /** Video dims — match the source aspect ratio. */
  width: number;
  height: number;
  // First keyframe as a JPEG (~ 50–200 KiB). Uploaded as the recording's OG/Twitter poster — viewer links in chat / X / etc. need this to show a thumbnail. Null when the muxer never saw a keyframe.
  posterBlob: Blob | null;
};

export type RecordPipelineState =
  | { status: "idle" }
  | { status: "armed" }
  | { status: "encoding"; durationMs: number }
  | { status: "over-cap" }
  | { status: "ready"; result: RecordPipelineResult }
  | { status: "aborted"; reason: string };

export type RecordPipelineArmOptions = {
  audioExpected: boolean;
};

export type RecordPipeline = {
  getState(): RecordPipelineState;
  subscribe(listener: (s: RecordPipelineState) => void): () => void;
  attach(): void;
  arm(options: RecordPipelineArmOptions): void;
  pause(): void;
  resume(): void;
  finish(): Promise<RecordPipelineResult | null>;
  abort(reason: string): void;
};

type VideoFormat = Extract<RecordingFrameEvent, { kind: "format" }>;
type AudioFormat = Extract<RecordingFrameEvent, { kind: "audio-format" }>;

/*
 * Muxes the native recorder's pre-encoded H.264/AAC records straight into a
 * fragmented MP4 — no decode, no re-encode. The native tap keeps emitting
 * chunks with wall-clock PTS while the recording is paused, so pause() drops
 * chunks and resume() splices at the next keyframe (2s GOP → up to ~2s of
 * post-resume content is trimmed), rebasing each track's PTS for continuity.
 */
class RecordMuxSession {
  private readonly format: VideoFormat;
  private readonly audioFormat: AudioFormat | null;
  private muxer: Fmp4Muxer | null;

  private splice: "live" | "paused" | "awaiting-key" = "live";
  private videoOffsetUs = 0;
  private audioOffsetUs = 0;
  private lastVideoEndUs = 0;
  private lastAudioEndUs = 0;
  private audioResyncPending = false;

  private videoDescribed = false;
  private audioDescribed = false;
  private muxedFrames = 0;
  private finalized = false;

  private posterPromise: Promise<Blob> | null = null;

  constructor(
    videoFormat: VideoFormat,
    audioFormat: AudioFormat | null,
    output: (bytes: Uint8Array, position: number) => void,
  ) {
    this.format = videoFormat;
    this.audioFormat = audioFormat;
    this.muxer = createFmp4Muxer({
      video: {
        width: videoFormat.codedWidth,
        height: videoFormat.codedHeight,
        frameRate: videoFormat.fps,
      },
      audio: audioFormat
        ? {
            numberOfChannels: audioFormat.numberOfChannels,
            sampleRate: audioFormat.sampleRate,
          }
        : null,
      output,
    });
  }

  pushChunk(chunk: Extract<RecordingFrameEvent, { kind: "chunk" }>): void {
    if (this.finalized)
      throw new Error("RecordMuxSession.pushChunk after stop()");
    if (!this.muxer) throw new Error("RecordMuxSession not initialized");
    if (this.splice === "paused") return;
    if (this.splice === "awaiting-key") {
      if (chunk.type !== "key") return;
      this.videoOffsetUs = chunk.timestamp - this.lastVideoEndUs;
      this.audioResyncPending = true;
      this.splice = "live";
    }
    const timestamp = chunk.timestamp - this.videoOffsetUs;
    if (!this.posterPromise && chunk.type === "key") {
      this.posterPromise = decodePosterJpeg({
        codec: NATIVE_RECORD_CODEC,
        codedWidth: this.format.codedWidth,
        codedHeight: this.format.codedHeight,
        description: this.format.description,
        keyChunk: chunk,
      });
    }
    this.muxer.addVideoChunkRaw(
      chunk.data,
      chunk.type,
      timestamp,
      chunk.duration,
      this.videoDescribed
        ? undefined
        : {
            decoderConfig: {
              codec: NATIVE_RECORD_CODEC,
              description: this.format.description,
            },
          },
    );
    this.videoDescribed = true;
    this.lastVideoEndUs = timestamp + chunk.duration;
    this.muxedFrames++;
  }

  pushAudioChunk(
    chunk: Extract<RecordingFrameEvent, { kind: "audio-chunk" }>,
  ): void {
    if (this.finalized) return;
    if (!this.muxer || !this.audioFormat) return;
    // Audio resumes with the video splice so both tracks cut the same stretch.
    if (this.splice !== "live") return;
    if (this.audioResyncPending) {
      this.audioOffsetUs = chunk.timestamp - this.lastAudioEndUs;
      this.audioResyncPending = false;
    }
    const timestamp = chunk.timestamp - this.audioOffsetUs;
    this.muxer.addAudioChunkRaw(
      chunk.data,
      timestamp,
      chunk.duration,
      this.audioDescribed
        ? undefined
        : {
            decoderConfig: {
              codec: "mp4a.40.2",
              numberOfChannels: this.audioFormat.numberOfChannels,
              sampleRate: this.audioFormat.sampleRate,
              description: this.audioFormat.description,
            },
          },
    );
    this.audioDescribed = true;
    this.lastAudioEndUs = timestamp + chunk.duration;
  }

  pause(): void {
    if (this.finalized) return;
    this.splice = "paused";
  }

  resume(): void {
    if (this.splice === "paused") this.splice = "awaiting-key";
  }

  /** Pause-adjusted duration of the muxed video track so far. */
  get durationMs(): number {
    return Math.round(this.lastVideoEndUs / 1_000);
  }

  async stop(): Promise<RecordPipelineResult> {
    if (this.finalized) throw new Error("RecordMuxSession.stop called twice");
    this.finalized = true;
    if (!this.muxer) throw new Error("RecordMuxSession.stop before init");

    this.muxer.finalize();
    // A missing poster is degraded but recoverable (no OG image, recording still works).
    const posterBlob = this.posterPromise
      ? await this.posterPromise.catch(() => null)
      : null;
    return {
      sizeBytes: this.muxer.totalBytes(),
      durationMs: this.durationMs,
      encodedFrames: this.muxedFrames,
      width: this.format.codedWidth,
      height: this.format.codedHeight,
      posterBlob,
    };
  }

  cancel(): void {
    if (this.finalized) return;
    this.finalized = true;
    this.muxer = null;
  }

  get isReady(): boolean {
    return !this.finalized;
  }
}

export function createRecordPipeline(io: RecordPipelineIO): RecordPipeline {
  const log: RecordPipelineLog = io.log ?? { info() {}, warn() {} };
  const capSlackMs = io.capSlackMs ?? DEFAULT_CAP_SLACK_MS;

  let session: RecordMuxSession | null = null;
  let state: RecordPipelineState = { status: "idle" };
  const listeners = new Set<(s: RecordPipelineState) => void>();
  let attached = false;
  let armed = false;
  let armOptions: RecordPipelineArmOptions | null = null;
  // Events that arrived before the session was created (format wait). Drained in order.
  let pendingChunks: RecordingFrameEvent[] = [];
  let pendingVideoFormat: VideoFormat | null = null;
  let pendingAudioFormat: AudioFormat | null = null;
  let audioWaitTimer: ReturnType<typeof setTimeout> | null = null;

  function setState(next: RecordPipelineState): void {
    state = next;
    for (const listener of listeners) {
      listener(next);
    }
  }

  function abort(reason: string): void {
    armed = false;
    session?.cancel();
    session = null;
    setState({ status: "aborted", reason });
  }

  function handleEvent(event: RecordingFrameEvent): void {
    if (!armed) return;
    if (event.kind === "format") {
      pendingVideoFormat = event;
      log.info(
        `record-pipeline: video format (${event.codedWidth}x${event.codedHeight}@${event.fps}fps)`,
      );
      tryStartSession();
      return;
    }
    if (event.kind === "audio-format") {
      pendingAudioFormat = event;
      log.info(
        `record-pipeline: audio format (${event.sampleRate}Hz, ${event.numberOfChannels}ch)`,
      );
      if (audioWaitTimer !== null) {
        clearTimeout(audioWaitTimer);
        audioWaitTimer = null;
      }
      tryStartSession();
      return;
    }
    if (event.kind === "chunk") {
      if (!session) {
        pendingChunks.push(event);
        setState({
          status: "encoding",
          durationMs: Math.round((event.timestamp + event.duration) / 1000),
        });
        return;
      }
      try {
        session.pushChunk(event);
      } catch (err) {
        abort(err instanceof Error ? err.message : String(err));
        return;
      }
      const durationMs = session.durationMs;
      if (io.capMs !== undefined && durationMs > io.capMs + capSlackMs) {
        session.cancel();
        session = null;
        pendingChunks = [];
        setState({ status: "over-cap" });
        return;
      }
      setState({ status: "encoding", durationMs });
      return;
    }
    if (event.kind === "audio-chunk") {
      if (!session) {
        pendingChunks.push(event);
        return;
      }
      try {
        session.pushAudioChunk(event);
      } catch (err) {
        // Audio failures shouldn't tear down the whole recording — log and continue.
        log.warn(
          `record-pipeline: audio chunk push failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      return;
    }
    // 'end' — the app calls finish() explicitly; nothing to do here.
    log.info("record-pipeline: native end-of-stream");
  }

  function tryStartSession(): void {
    if (session) return;
    if (!armOptions) {
      log.warn("record-pipeline: format event arrived without armOptions");
      return;
    }
    const videoFormat = pendingVideoFormat;
    if (!videoFormat) return;
    const audioFormat = pendingAudioFormat;
    if (armOptions.audioExpected && !audioFormat) {
      // Wait briefly for audio-format, then fall back to video-only if it never arrives.
      if (audioWaitTimer === null) {
        audioWaitTimer = setTimeout(() => {
          audioWaitTimer = null;
          if (session) return;
          log.warn(
            `record-pipeline: audio-format did not arrive within ${AUDIO_FORMAT_WAIT_MS}ms — proceeding video-only`,
          );
          startSession(videoFormat, null);
        }, AUDIO_FORMAT_WAIT_MS);
      }
      return;
    }
    startSession(videoFormat, audioFormat);
  }

  function startSession(
    videoFormat: VideoFormat,
    audioFormat: AudioFormat | null,
  ): void {
    if (session) return;
    session = new RecordMuxSession(videoFormat, audioFormat, io.output);
    const queued = pendingChunks;
    pendingChunks = [];
    for (const evt of queued) {
      if (!session) break;
      try {
        if (evt.kind === "chunk") {
          session.pushChunk(evt);
        } else if (evt.kind === "audio-chunk") {
          session.pushAudioChunk(evt);
        }
      } catch (err) {
        abort(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    setState({ status: "encoding", durationMs: 0 });
  }

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      listener(state);
      return () => {
        listeners.delete(listener);
      };
    },
    /** Connect the frame-event source. Idempotent — safe in React StrictMode. */
    attach() {
      if (attached) return;
      attached = true;
      io.frameEvents((event) => handleEvent(event));
    },
    /** Mark a new recording session as expecting recording frames. The
     *  mux session is instantiated lazily on the first 'format' event. */
    arm(options) {
      session?.cancel();
      session = null;
      pendingChunks = [];
      pendingVideoFormat = null;
      pendingAudioFormat = null;
      if (audioWaitTimer !== null) {
        clearTimeout(audioWaitTimer);
        audioWaitTimer = null;
      }
      armOptions = options;
      log.info(`record-pipeline: arm (audioExpected=${options.audioExpected})`);
      armed = true;
      setState({ status: "armed" });
    },
    /** Drop chunks until resume; the native tap keeps emitting while paused. */
    pause() {
      session?.pause();
    },
    resume() {
      session?.resume();
    },
    /** Finalize the mux session. The caller gets the last muxed bytes via
     *  `output` during the finalize pass. */
    async finish() {
      armed = false;
      const current = session;
      session = null;
      if (!current || !current.isReady) return null;
      try {
        const result = await current.stop();
        setState({ status: "ready", result });
        return result;
      } catch (err) {
        const reason = err instanceof Error ? err.message : String(err);
        setState({ status: "aborted", reason });
        return null;
      }
    },
    /** Discard the in-flight mux session. */
    abort,
  };
}
