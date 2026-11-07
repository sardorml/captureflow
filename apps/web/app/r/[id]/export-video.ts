import {
  ALL_FORMATS,
  AudioBufferSink,
  AudioBufferSource,
  BufferTarget,
  CanvasSink,
  CanvasSource,
  Input,
  Mp4OutputFormat,
  Output,
  QUALITY_HIGH,
  QUALITY_VERY_HIGH,
  UrlSource,
  canEncodeAudio,
  canEncodeVideo,
  type InputAudioTrack,
  type WrappedCanvas,
} from "mediabunny";
import { registerAacEncoder } from "@mediabunny/aac-encoder";
import {
  isRecordingGradientKey,
  isRecordingHexColor,
  RECORDING_GRADIENT_PRESETS,
  recordingBackgroundImageFile,
  recordingWallpaperUrl,
  type RecordingConfig,
} from "@/lib/recording-config";
import {
  bubbleRect,
  coverRect,
  editedDuration,
  exportCanvas,
  frameLayout,
  gradientLine,
  keptSegments,
  mixInto,
  scaleCanvas,
  sourceTimeAt,
  type ExportSources,
  type KeptSegment,
  type Rect,
} from "@/lib/recording/export-plan";

type Canvas2D = OffscreenCanvasRenderingContext2D;

const FPS = 30;
// Screen text survives a re-encode only well above the usual web rate.
const BITS_PER_PIXEL = 0.2;
const SAMPLE_RATE = 48_000;
const CHANNELS = 2;
const WINDOW_SEC = 2;
const SIZE_STEPS = [
  [Infinity, Infinity],
  [3840, 2160],
  [1920, 1080],
] as const;
const IMAGE_PLACEHOLDER = "#27272a";

export class ExportUnsupportedError extends Error {}

export async function renderEditedVideo(
  sources: ExportSources,
  config: RecordingConfig,
  onProgress: (fraction: number) => void,
  signal: AbortSignal,
): Promise<Blob> {
  if (
    typeof VideoEncoder === "undefined" ||
    typeof OffscreenCanvas === "undefined"
  ) {
    throw new ExportUnsupportedError();
  }
  const main = new Input({
    source: new UrlSource(sources.videoUrl),
    formats: ALL_FORMATS,
  });
  const cam = sources.webcamUrl
    ? new Input({
        source: new UrlSource(sources.webcamUrl),
        formats: ALL_FORMATS,
      })
    : null;
  let output: Output | null = null;
  try {
    const mainVideo = await main.getPrimaryVideoTrack();
    if (!mainVideo) throw new Error("Recording has no video track");
    const camVideo =
      cam && !config.cameraHidden ? await cam.getPrimaryVideoTrack() : null;
    const audioTracks = (
      await Promise.all([
        config.systemMuted ? null : main.getPrimaryAudioTrack(),
        cam && !config.micMuted ? cam.getPrimaryAudioTrack() : null,
      ])
    ).filter((t): t is InputAudioTrack => !!t);

    const framed = config.background !== "transparent";
    const layout = await outputLayout(
      exportCanvas(
        mainVideo.displayWidth,
        mainVideo.displayHeight,
        config.padding,
        framed,
      ),
    );
    const { width, height } = layout;
    const duration = await mainVideo.computeDuration();
    const segments = keptSegments(duration, config.cuts);
    const total = editedDuration(segments);
    if (total <= 0) throw new Error("Nothing left after cuts");

    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new ExportUnsupportedError();
    ctx.imageSmoothingQuality = "high";
    const paintBackground = await backgroundPainter(
      config.background,
      sources.backgroundImageUrl,
      width,
      height,
    );

    output = new Output({
      format: new Mp4OutputFormat({ fastStart: "in-memory" }),
      target: new BufferTarget(),
    });
    const videoSource = new CanvasSource(canvas, {
      codec: "avc",
      bitrate: Math.round(width * height * FPS * BITS_PER_PIXEL),
      latencyMode: "quality",
      keyFrameInterval: 2,
    });
    output.addVideoTrack(videoSource, { frameRate: FPS });
    let audioSource: AudioBufferSource | null = null;
    if (audioTracks.length) {
      if (
        !(await canEncodeAudio("aac", {
          numberOfChannels: CHANNELS,
          sampleRate: SAMPLE_RATE,
        }))
      ) {
        registerAacEncoder();
      }
      audioSource = new AudioBufferSource({
        codec: "aac",
        bitrate: QUALITY_HIGH,
      });
      output.addAudioTrack(audioSource);
    }
    await output.start();

    const frameCount = Math.max(1, Math.round(total * FPS));
    const times = function* () {
      for (let i = 0; i < frameCount; i++)
        yield sourceTimeAt(i / FPS, segments);
    };
    const mainFrames = new CanvasSink(mainVideo, {
      poolSize: 2,
    }).canvasesAtTimestamps(times());
    const camFrames = camVideo
      ? new CanvasSink(camVideo, { poolSize: 2 }).canvasesAtTimestamps(times())
      : null;
    const mixer = audioMixer(
      audioTracks.map((t) => new AudioBufferSink(t)),
      segments,
    );

    const { radius, shadow } = frameLayout(width, height, config);
    const screen = maskedLayer(layout.rect, framed ? radius : 0);
    const bubble = camFrames
      ? maskedLayer(
          roundRect(
            bubbleRect(width, height, {
              corner: config.cameraCorner,
              point: config.cameraPoint,
              size: config.cameraSize,
            }),
          ),
          "circle",
        )
      : null;

    let lastMain: WrappedCanvas | null = null;
    let lastCam: WrappedCanvas | null = null;
    let index = 0;
    for (let windowStart = 0; windowStart < total; windowStart += WINDOW_SEC) {
      const windowEnd = Math.min(total, windowStart + WINDOW_SEC);
      for (; index < frameCount && index / FPS < windowEnd; index++) {
        if (signal.aborted) throw signal.reason;
        lastMain = (await mainFrames.next()).value ?? lastMain;
        if (camFrames) lastCam = (await camFrames.next()).value ?? lastCam;
        paintBackground(ctx);
        if (framed) drawShadow(ctx, layout.rect, radius, shadow);
        if (lastMain) screen.draw(ctx, lastMain.canvas, "contain");
        if (bubble && lastCam) bubble.draw(ctx, lastCam.canvas, "cover");
        await videoSource.add(index / FPS, 1 / FPS);
        onProgress(index / frameCount);
      }
      if (audioSource) {
        await audioSource.add(await mixer.mix(windowStart, windowEnd));
      }
    }

    mixer.close();
    videoSource.close();
    audioSource?.close();
    await output.finalize();
    onProgress(1);
    const buffer = (output.target as BufferTarget).buffer;
    if (!buffer) throw new Error("Export produced no data");
    return new Blob([buffer], { type: "video/mp4" });
  } catch (error) {
    if (output && output.state !== "finalized")
      await output.cancel().catch(() => {});
    throw error;
  } finally {
    main.dispose();
    cam?.dispose();
  }
}

type CanvasLayout = ReturnType<typeof exportCanvas>;

async function outputLayout(native: CanvasLayout): Promise<CanvasLayout> {
  for (const [maxWidth, maxHeight] of SIZE_STEPS) {
    const layout = scaleCanvas(
      native,
      Math.min(maxWidth / native.width, maxHeight / native.height, 1),
    );
    if (
      await canEncodeVideo("avc", {
        width: layout.width,
        height: layout.height,
        bitrate: QUALITY_VERY_HIGH,
      })
    ) {
      return layout;
    }
  }
  throw new ExportUnsupportedError();
}

async function backgroundPainter(
  background: string,
  uploadedUrl: string | null,
  width: number,
  height: number,
): Promise<(ctx: Canvas2D) => void> {
  if (isRecordingHexColor(background)) {
    return (ctx) => {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
    };
  }
  if (isRecordingGradientKey(background)) {
    const line = gradientLine(width, height, 135);
    const stops = RECORDING_GRADIENT_PRESETS[background].stops;
    return (ctx) => {
      const g = ctx.createLinearGradient(line.x0, line.y0, line.x1, line.y1);
      for (const s of stops) g.addColorStop(s.offset, s.color);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    };
  }
  const imageUrl = recordingBackgroundImageFile(background)
    ? uploadedUrl
    : recordingWallpaperUrl(background, "full");
  const image = imageUrl ? await loadImage(imageUrl) : null;
  return (ctx) => {
    ctx.fillStyle = background === "transparent" ? "#000" : IMAGE_PLACEHOLDER;
    ctx.fillRect(0, 0, width, height);
    if (image) {
      const r = coverRect(image.width, image.height, {
        x: 0,
        y: 0,
        width,
        height,
      });
      ctx.drawImage(image, r.x, r.y, r.width, r.height);
    }
  };
}

async function loadImage(url: string): Promise<ImageBitmap | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await createImageBitmap(await res.blob());
  } catch {
    return null;
  }
}

function roundRect(r: Rect): Rect {
  return {
    x: Math.round(r.x),
    y: Math.round(r.y),
    width: Math.round(r.width),
    height: Math.round(r.height),
  };
}

function drawShadow(
  ctx: Canvas2D,
  rect: Rect,
  radius: number,
  shadow: ReturnType<typeof frameLayout>["shadow"],
): void {
  if (shadow.alpha <= 0) return;
  const shrink = -shadow.spread;
  ctx.save();
  ctx.shadowColor = `rgba(0,0,0,${shadow.alpha})`;
  ctx.shadowBlur = shadow.blur;
  ctx.shadowOffsetY = shadow.offsetY;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.roundRect(
    rect.x + shrink,
    rect.y + shrink,
    rect.width - 2 * shrink,
    rect.height - 2 * shrink,
    Math.max(0, radius - shrink),
  );
  ctx.fill();
  ctx.restore();
}

/*
 * Draws a picture into a rect through an anti-aliased mask. Chrome's
 * canvas clip() leaves hard, stair-stepped edges on curves; compositing
 * against a filled shape keeps them smooth.
 */
function maskedLayer(rect: Rect, shape: number | "circle") {
  const layer = new OffscreenCanvas(rect.width, rect.height);
  const lctx = layer.getContext("2d")!;
  lctx.imageSmoothingQuality = "high";
  const mask = new OffscreenCanvas(rect.width, rect.height);
  const mctx = mask.getContext("2d")!;
  mctx.beginPath();
  if (shape === "circle") {
    mctx.arc(rect.width / 2, rect.height / 2, rect.width / 2, 0, Math.PI * 2);
  } else {
    mctx.roundRect(0, 0, rect.width, rect.height, shape);
  }
  mctx.fill();
  const box: Rect = { x: 0, y: 0, width: rect.width, height: rect.height };
  return {
    draw(
      ctx: Canvas2D,
      src: OffscreenCanvas | HTMLCanvasElement,
      fit: "contain" | "cover",
    ) {
      lctx.globalCompositeOperation = "copy";
      lctx.fillStyle = "#000";
      lctx.fillRect(0, 0, rect.width, rect.height);
      lctx.globalCompositeOperation = "source-over";
      const r =
        fit === "cover"
          ? coverRect(src.width, src.height, box)
          : containRect(src.width, src.height, box);
      lctx.drawImage(src, r.x, r.y, r.width, r.height);
      lctx.globalCompositeOperation = "destination-in";
      lctx.drawImage(mask, 0, 0);
      ctx.drawImage(layer, rect.x, rect.y);
    },
  };
}

function containRect(srcWidth: number, srcHeight: number, box: Rect): Rect {
  const scale = Math.min(box.width / srcWidth, box.height / srcHeight);
  const width = srcWidth * scale;
  const height = srcHeight * scale;
  return {
    x: box.x + (box.width - width) / 2,
    y: box.y + (box.height - height) / 2,
    width,
    height,
  };
}

type HeldBuffer = {
  channels: Float32Array[];
  sampleRate: number;
  timestamp: number;
  end: number;
};

/*
 * One decoder pass over a kept segment, read forward window by window. A
 * fresh read per window would restart the decoder at every window edge, and
 * AAC's first frame after a restart decodes wrong: a click every window.
 */
function segmentReader(sink: AudioBufferSink, segment: KeptSegment) {
  const iterator = sink.buffers(segment.srcStart, segment.srcEnd);
  let held: HeldBuffer[] = [];
  let done = false;
  return {
    async upTo(srcTime: number): Promise<HeldBuffer[]> {
      while (!done && (held[held.length - 1]?.end ?? -Infinity) < srcTime) {
        const next = await iterator.next();
        if (next.done) {
          done = true;
          break;
        }
        const { buffer, timestamp } = next.value;
        held.push({
          channels: Array.from({ length: buffer.numberOfChannels }, (_, c) =>
            buffer.getChannelData(c),
          ),
          sampleRate: buffer.sampleRate,
          timestamp,
          end: timestamp + buffer.length / buffer.sampleRate,
        });
      }
      return held;
    },
    drop(srcTime: number): void {
      held = held.filter((b) => b.end > srcTime);
    },
    close(): void {
      done = true;
      held = [];
      void iterator.return(undefined);
    },
  };
}

type SegmentReader = ReturnType<typeof segmentReader>;

function audioMixer(
  sinks: AudioBufferSink[],
  segments: readonly KeptSegment[],
) {
  const readers = new Map<string, SegmentReader>();
  const readerFor = (s: number, g: number) => {
    const key = `${s}:${g}`;
    let reader = readers.get(key);
    if (!reader) {
      reader = segmentReader(sinks[s]!, segments[g]!);
      readers.set(key, reader);
    }
    return reader;
  };
  return {
    async mix(windowStart: number, windowEnd: number): Promise<AudioBuffer> {
      const first = Math.round(windowStart * SAMPLE_RATE);
      const length = Math.max(1, Math.round(windowEnd * SAMPLE_RATE) - first);
      const out = Array.from(
        { length: CHANNELS },
        () => new Float32Array(length),
      );
      for (let s = 0; s < sinks.length; s++) {
        for (let g = 0; g < segments.length; g++) {
          const segment = segments[g]!;
          const segEnd = segment.outStart + (segment.srcEnd - segment.srcStart);
          if (segEnd <= windowStart) {
            readers.get(`${s}:${g}`)?.close();
            readers.delete(`${s}:${g}`);
            continue;
          }
          const to = Math.min(windowEnd, segEnd);
          if (to <= Math.max(windowStart, segment.outStart)) continue;
          const srcTo = segment.srcStart + (to - segment.outStart);
          const reader = readerFor(s, g);
          for (const held of await reader.upTo(srcTo)) {
            mixInto(out, SAMPLE_RATE, first, held, segment, {
              in: g > 0,
              out: g < segments.length - 1,
            });
          }
          reader.drop(srcTo);
        }
      }
      return toAudioBuffer(out, length);
    },
    close(): void {
      for (const reader of readers.values()) reader.close();
      readers.clear();
    },
  };
}

function toAudioBuffer(
  out: Float32Array<ArrayBuffer>[],
  length: number,
): AudioBuffer {
  const buffer = new AudioBuffer({
    length,
    numberOfChannels: CHANNELS,
    sampleRate: SAMPLE_RATE,
  });
  out.forEach((data, c) => {
    for (let i = 0; i < data.length; i++)
      data[i] = Math.max(-1, Math.min(1, data[i]!));
    buffer.copyToChannel(data, c);
  });
  return buffer;
}
