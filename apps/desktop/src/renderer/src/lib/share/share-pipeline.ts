import { CompositingShareEncoder } from "./share-compositing-encoder";
import type { ShareEncoderResult } from "./share-encoder";
import type { CursorPosition, ShareFrameEvent } from "../../../../shared/types";
import { logRendererInfo, logRendererWarn } from "./share-log";

export type ShareArmOptions = {
  audioExpected: boolean;
};

const AUDIO_FORMAT_WAIT_MS = 1000;

export const SHARE_CAP_MS = 300_000;
const SHARE_CAP_SLACK_MS = 2_000;

const CURSOR_BUFFER_MAX = 8_000; // ~60s of 120fps samples
const cursorBuffer: CursorPosition[] = [];

export type SharePipelineState =
  | { status: "idle" }
  | { status: "armed" }
  | { status: "encoding"; durationMs: number }
  | { status: "over-cap" }
  | { status: "ready"; result: ShareEncoderResult }
  | { status: "aborted"; reason: string };

class SharePipeline {
  private encoder: CompositingShareEncoder | null = null;
  private state: SharePipelineState = { status: "idle" };
  private listeners = new Set<(s: SharePipelineState) => void>();
  private attached = false;
  private armed = false;
  private armOptions: ShareArmOptions | null = null;
  // Events that arrived before the encoder finished initialising. Drained in order once ready.
  private pendingChunks: ShareFrameEvent[] = [];
  private encoderInitializing = false;
  private cursorUnsub: (() => void) | null = null;
  private pendingVideoFormat: Extract<
    ShareFrameEvent,
    { kind: "format" }
  > | null = null;
  private pendingAudioFormat: Extract<
    ShareFrameEvent,
    { kind: "audio-format" }
  > | null = null;
  private audioWaitTimer: number | null = null;

  getState(): SharePipelineState {
    return this.state;
  }

  subscribe(listener: (s: SharePipelineState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Connect the IPC bridge. Idempotent — safe in React StrictMode. */
  attach(): void {
    if (this.attached) return;
    this.attached = true;
    window.electronAPI.onShareFrameEvent((event) => this.handleEvent(event));
  }

  /** Mark a new recording session as expecting share frames. The
   *  encoder is instantiated lazily on the first 'format' event. */
  arm(options: ShareArmOptions): void {
    this.encoder?.cancel();
    this.encoder = null;
    this.pendingChunks = [];
    this.encoderInitializing = false;
    this.pendingVideoFormat = null;
    this.pendingAudioFormat = null;
    if (this.audioWaitTimer !== null) {
      window.clearTimeout(this.audioWaitTimer);
      this.audioWaitTimer = null;
    }
    cursorBuffer.length = 0;
    this.cursorUnsub?.();
    this.cursorUnsub = null;
    this.armOptions = options;
    logRendererInfo(
      `share-pipeline: arm (audioExpected=${options.audioExpected})`,
    );

    this.cursorUnsub = window.electronAPI.onCursorPosition((pos) => {
      cursorBuffer.push(pos);
      if (cursorBuffer.length > CURSOR_BUFFER_MAX) {
        cursorBuffer.splice(0, cursorBuffer.length - CURSOR_BUFFER_MAX);
      }
    });
    this.armed = true;
    this.setState({ status: "armed" });
  }

  /** Finalize the encoder. Main gets the last muxed bytes via
   *  onChunkBytes during the muxer.finalize() pass. */
  async finish(): Promise<ShareEncoderResult | null> {
    this.armed = false;
    const current = this.encoder;
    this.encoder = null;
    this.cursorUnsub?.();
    this.cursorUnsub = null;
    if (!current || !current.isReady) return null;
    try {
      const result = await current.stop();
      this.setState({ status: "ready", result });
      return result;
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      this.setState({ status: "aborted", reason });
      return null;
    }
  }

  /** Discard the in-flight encoder. */
  abort(reason: string): void {
    this.armed = false;
    this.encoder?.cancel();
    this.encoder = null;
    this.cursorUnsub?.();
    this.cursorUnsub = null;
    this.setState({ status: "aborted", reason });
  }

  private handleEvent(event: ShareFrameEvent): void {
    if (!this.armed) return;
    if (event.kind === "format") {
      this.pendingVideoFormat = event;
      logRendererInfo(
        `share-pipeline: video format (${event.codedWidth}x${event.codedHeight}@${event.fps}fps)`,
      );
      this.tryStartEncoder();
      return;
    }
    if (event.kind === "audio-format") {
      this.pendingAudioFormat = event;
      logRendererInfo(
        `share-pipeline: audio format (${event.sampleRate}Hz, ${event.numberOfChannels}ch)`,
      );
      if (this.audioWaitTimer !== null) {
        window.clearTimeout(this.audioWaitTimer);
        this.audioWaitTimer = null;
      }
      this.tryStartEncoder();
      return;
    }
    if (event.kind === "chunk") {
      const endUs = event.timestamp + event.duration;
      const durationMs = Math.round(endUs / 1000);
      if (durationMs > SHARE_CAP_MS + SHARE_CAP_SLACK_MS) {
        this.encoder?.cancel();
        this.encoder = null;
        this.pendingChunks = [];
        this.setState({ status: "over-cap" });
        return;
      }
      if (this.encoderInitializing || !this.encoder) {
        this.pendingChunks.push(event);
        this.setState({ status: "encoding", durationMs });
        return;
      }
      try {
        this.encoder.pushChunk({
          type: event.type,
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data,
        });
        this.setState({ status: "encoding", durationMs });
      } catch (err) {
        this.abort(err instanceof Error ? err.message : String(err));
      }
      return;
    }
    if (event.kind === "audio-chunk") {
      if (this.encoderInitializing || !this.encoder) {
        this.pendingChunks.push(event);
        return;
      }
      try {
        this.encoder.pushAudioChunk({
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data,
        });
      } catch (err) {
        // Audio failures shouldn't tear down the whole share — log and continue.
        logRendererWarn(
          `share-pipeline: audio chunk push failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      return;
    }
    // 'end' — recorder hook calls finish() explicitly; nothing to do here.
    logRendererInfo("share-pipeline: native end-of-stream");
  }

  private tryStartEncoder(): void {
    if (this.encoder || this.encoderInitializing) return;
    if (!this.armOptions) {
      logRendererWarn(
        "share-pipeline: format event arrived without armOptions",
      );
      return;
    }
    const videoFormat = this.pendingVideoFormat;
    if (!videoFormat) return;
    const audioFormat = this.pendingAudioFormat;
    if (this.armOptions.audioExpected && !audioFormat) {
      // Wait briefly for audio-format, then fall back to video-only if it never arrives.
      if (this.audioWaitTimer === null) {
        this.audioWaitTimer = window.setTimeout(() => {
          this.audioWaitTimer = null;
          if (this.encoder || this.encoderInitializing) return;
          logRendererWarn(
            `share-pipeline: audio-format did not arrive within ${AUDIO_FORMAT_WAIT_MS}ms — proceeding video-only`,
          );
          this.startEncoder(videoFormat, null);
        }, AUDIO_FORMAT_WAIT_MS);
      }
      return;
    }
    this.startEncoder(videoFormat, audioFormat);
  }

  private startEncoder(
    videoFormat: Extract<ShareFrameEvent, { kind: "format" }>,
    audioFormat: Extract<ShareFrameEvent, { kind: "audio-format" }> | null,
  ): void {
    if (this.encoder || this.encoderInitializing) return;
    const format = {
      codedWidth: videoFormat.codedWidth,
      codedHeight: videoFormat.codedHeight,
      fps: videoFormat.fps,
      description: videoFormat.description,
    };
    const compositing = new CompositingShareEncoder({
      format,
      cursorPositions: () => cursorBuffer,
      audioConfig: audioFormat
        ? {
            sampleRate: audioFormat.sampleRate,
            numberOfChannels: audioFormat.numberOfChannels,
            description: audioFormat.description,
          }
        : null,
      onChunkBytes: (bytes) => {
        // Copy into a fresh ArrayBuffer so IPC's structured clone doesn't
        // transfer the larger buffer backing this Uint8Array view.
        const out = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(out).set(bytes);
        window.electronAPI.sharePartScreen(out);
      },
    });
    this.encoder = compositing;
    this.encoderInitializing = true;
    void compositing
      .init()
      .then(() => {
        this.encoderInitializing = false;
        const queued = this.pendingChunks;
        this.pendingChunks = [];
        for (const evt of queued) {
          if (!this.encoder) break;
          try {
            if (evt.kind === "chunk") {
              this.encoder.pushChunk({
                type: evt.type,
                timestamp: evt.timestamp,
                duration: evt.duration,
                data: evt.data,
              });
            } else if (evt.kind === "audio-chunk") {
              this.encoder.pushAudioChunk({
                timestamp: evt.timestamp,
                duration: evt.duration,
                data: evt.data,
              });
            }
          } catch (err) {
            this.abort(err instanceof Error ? err.message : String(err));
            break;
          }
        }
      })
      .catch((err: unknown) => {
        this.encoderInitializing = false;
        this.encoder = null;
        this.pendingChunks = [];
        const reason = err instanceof Error ? err.message : String(err);
        logRendererWarn(`share-pipeline: compositing init failed: ${reason}`);
        this.setState({ status: "aborted", reason });
      });
    this.setState({ status: "encoding", durationMs: 0 });
  }

  private setState(next: SharePipelineState): void {
    this.state = next;
    for (const listener of this.listeners) {
      listener(next);
    }
  }
}

export const sharePipeline = new SharePipeline();
