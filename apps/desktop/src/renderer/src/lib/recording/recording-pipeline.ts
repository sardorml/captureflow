import { RecordingMuxer } from "./recording-mux";
import type { RecordingEncoderResult } from "./recording-encoder";
import type { RecordingFrameEvent } from "../../../../shared/types";
import { logRendererInfo, logRendererWarn } from "./recording-log";

export type RecordingArmOptions = {
  audioExpected: boolean;
};

const AUDIO_FORMAT_WAIT_MS = 1000;

export const RECORDING_CAP_MS = 300_000;
const RECORDING_CAP_SLACK_MS = 2_000;

export type RecordingPipelineState =
  | { status: "idle" }
  | { status: "armed" }
  | { status: "encoding"; durationMs: number }
  | { status: "over-cap" }
  | { status: "ready"; result: RecordingEncoderResult }
  | { status: "aborted"; reason: string };

class RecordingPipeline {
  private muxer: RecordingMuxer | null = null;
  private state: RecordingPipelineState = { status: "idle" };
  private listeners = new Set<(s: RecordingPipelineState) => void>();
  private attached = false;
  private armed = false;
  private armOptions: RecordingArmOptions | null = null;
  // Events that arrived before the muxer was created (format wait). Drained in order.
  private pendingChunks: RecordingFrameEvent[] = [];
  private pendingVideoFormat: Extract<
    RecordingFrameEvent,
    { kind: "format" }
  > | null = null;
  private pendingAudioFormat: Extract<
    RecordingFrameEvent,
    { kind: "audio-format" }
  > | null = null;
  private audioWaitTimer: number | null = null;

  getState(): RecordingPipelineState {
    return this.state;
  }

  subscribe(listener: (s: RecordingPipelineState) => void): () => void {
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
    window.electronAPI.onRecordingFrameEvent((event) =>
      this.handleEvent(event),
    );
  }

  /** Mark a new recording session as expecting recording frames. The
   *  muxer is instantiated lazily on the first 'format' event. */
  arm(options: RecordingArmOptions): void {
    this.muxer?.cancel();
    this.muxer = null;
    this.pendingChunks = [];
    this.pendingVideoFormat = null;
    this.pendingAudioFormat = null;
    if (this.audioWaitTimer !== null) {
      window.clearTimeout(this.audioWaitTimer);
      this.audioWaitTimer = null;
    }
    this.armOptions = options;
    logRendererInfo(
      `recording-pipeline: arm (audioExpected=${options.audioExpected})`,
    );
    this.armed = true;
    this.setState({ status: "armed" });
  }

  /** Drop chunks until resume; the native tap keeps emitting while paused. */
  pause(): void {
    this.muxer?.pause();
  }

  resume(): void {
    this.muxer?.resume();
  }

  /** Finalize the muxer. Main gets the last muxed bytes via
   *  onChunkBytes during the muxer.finalize() pass. */
  async finish(): Promise<RecordingEncoderResult | null> {
    this.armed = false;
    const current = this.muxer;
    this.muxer = null;
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

  /** Discard the in-flight muxer. */
  abort(reason: string): void {
    this.armed = false;
    this.muxer?.cancel();
    this.muxer = null;
    this.setState({ status: "aborted", reason });
  }

  private handleEvent(event: RecordingFrameEvent): void {
    if (!this.armed) return;
    if (event.kind === "format") {
      this.pendingVideoFormat = event;
      logRendererInfo(
        `recording-pipeline: video format (${event.codedWidth}x${event.codedHeight}@${event.fps}fps)`,
      );
      this.tryStartMuxer();
      return;
    }
    if (event.kind === "audio-format") {
      this.pendingAudioFormat = event;
      logRendererInfo(
        `recording-pipeline: audio format (${event.sampleRate}Hz, ${event.numberOfChannels}ch)`,
      );
      if (this.audioWaitTimer !== null) {
        window.clearTimeout(this.audioWaitTimer);
        this.audioWaitTimer = null;
      }
      this.tryStartMuxer();
      return;
    }
    if (event.kind === "chunk") {
      if (!this.muxer) {
        this.pendingChunks.push(event);
        this.setState({
          status: "encoding",
          durationMs: Math.round((event.timestamp + event.duration) / 1000),
        });
        return;
      }
      try {
        this.muxer.pushChunk({
          type: event.type,
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data,
        });
      } catch (err) {
        this.abort(err instanceof Error ? err.message : String(err));
        return;
      }
      const durationMs = this.muxer.durationMs;
      if (durationMs > RECORDING_CAP_MS + RECORDING_CAP_SLACK_MS) {
        this.muxer.cancel();
        this.muxer = null;
        this.pendingChunks = [];
        this.setState({ status: "over-cap" });
        return;
      }
      this.setState({ status: "encoding", durationMs });
      return;
    }
    if (event.kind === "audio-chunk") {
      if (!this.muxer) {
        this.pendingChunks.push(event);
        return;
      }
      try {
        this.muxer.pushAudioChunk({
          timestamp: event.timestamp,
          duration: event.duration,
          data: event.data,
        });
      } catch (err) {
        // Audio failures shouldn't tear down the whole recording — log and continue.
        logRendererWarn(
          `recording-pipeline: audio chunk push failed: ${
            err instanceof Error ? err.message : String(err)
          }`,
        );
      }
      return;
    }
    // 'end' — recorder hook calls finish() explicitly; nothing to do here.
    logRendererInfo("recording-pipeline: native end-of-stream");
  }

  private tryStartMuxer(): void {
    if (this.muxer) return;
    if (!this.armOptions) {
      logRendererWarn(
        "recording-pipeline: format event arrived without armOptions",
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
          if (this.muxer) return;
          logRendererWarn(
            `recording-pipeline: audio-format did not arrive within ${AUDIO_FORMAT_WAIT_MS}ms — proceeding video-only`,
          );
          this.startMuxer(videoFormat, null);
        }, AUDIO_FORMAT_WAIT_MS);
      }
      return;
    }
    this.startMuxer(videoFormat, audioFormat);
  }

  private startMuxer(
    videoFormat: Extract<RecordingFrameEvent, { kind: "format" }>,
    audioFormat: Extract<RecordingFrameEvent, { kind: "audio-format" }> | null,
  ): void {
    if (this.muxer) return;
    this.muxer = new RecordingMuxer({
      format: {
        codedWidth: videoFormat.codedWidth,
        codedHeight: videoFormat.codedHeight,
        fps: videoFormat.fps,
        description: videoFormat.description,
      },
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
        window.electronAPI.recordingPartScreen(out);
      },
    });
    const queued = this.pendingChunks;
    this.pendingChunks = [];
    for (const evt of queued) {
      if (!this.muxer) break;
      try {
        if (evt.kind === "chunk") {
          this.muxer.pushChunk({
            type: evt.type,
            timestamp: evt.timestamp,
            duration: evt.duration,
            data: evt.data,
          });
        } else if (evt.kind === "audio-chunk") {
          this.muxer.pushAudioChunk({
            timestamp: evt.timestamp,
            duration: evt.duration,
            data: evt.data,
          });
        }
      } catch (err) {
        this.abort(err instanceof Error ? err.message : String(err));
        return;
      }
    }
    this.setState({ status: "encoding", durationMs: 0 });
  }

  private setState(next: RecordingPipelineState): void {
    this.state = next;
    for (const listener of this.listeners) {
      listener(next);
    }
  }
}

export const recordingPipeline = new RecordingPipeline();
