import {
  FilesetResolver,
  ImageSegmenter,
  type ImageSegmenterResult,
} from "@mediapipe/tasks-vision";
import {
  CAMERA_BACKGROUNDS,
  CAMERA_FILTERS,
  type CameraEffect,
} from "./camera-effects";

export type CameraEffectStream = {
  // The processed video track plus the source's audio tracks, untouched.
  stream: MediaStream;
  setEffect: (effect: CameraEffect) => void;
  stop: () => void;
};

// Segmentation runs on a small copy of the frame; the mask is scaled back up
// with bilinear filtering, which also softens its edge.
const MASK_WIDTH = 256;
const BLUR_PX = 14;
const FPS = 30;

let segmenterPromise: Promise<ImageSegmenter> | null = null;

// One segmenter per document, created on first use. assetBase is the
// extension URL of the folder holding the wasm runtime and the model.
function loadSegmenter(assetBase: string): Promise<ImageSegmenter> {
  segmenterPromise ??= (async () => {
    const fileset = await FilesetResolver.forVisionTasks(assetBase);
    return ImageSegmenter.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: `${assetBase}/selfie_segmenter.tflite`,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      outputCategoryMask: false,
      outputConfidenceMasks: true,
    });
  })();
  segmenterPromise.catch(() => {
    segmenterPromise = null;
  });
  return segmenterPromise;
}

function needsMask(effect: CameraEffect): boolean {
  return effect.background !== "none";
}

async function playing(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= 2 && video.videoWidth > 0) return;
  await new Promise<void>((resolve) => {
    video.addEventListener("loadeddata", () => resolve(), { once: true });
  });
}

export async function createCameraEffectStream(
  source: MediaStream,
  initial: CameraEffect,
  assetBase: string,
): Promise<CameraEffectStream> {
  let effect = initial;

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = new MediaStream(source.getVideoTracks());
  await video.play();
  await playing(video);

  const width = video.videoWidth;
  const height = video.videoHeight;
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("camera effects: no 2d context");

  // The person cut out of the frame, before it goes over the background.
  const person = document.createElement("canvas");
  person.width = width;
  person.height = height;
  const personCtx = person.getContext("2d");
  if (!personCtx) throw new Error("camera effects: no 2d context");

  const maskHeight = Math.max(1, Math.round((MASK_WIDTH * height) / width));
  const small = document.createElement("canvas");
  small.width = MASK_WIDTH;
  small.height = maskHeight;
  const smallCtx = small.getContext("2d", { willReadFrequently: true });
  const mask = document.createElement("canvas");
  mask.width = MASK_WIDTH;
  mask.height = maskHeight;
  const maskCtx = mask.getContext("2d");
  if (!smallCtx || !maskCtx) throw new Error("camera effects: no 2d context");
  const maskPixels = maskCtx.createImageData(MASK_WIDTH, maskHeight);
  // Opaque white; only the alpha channel is written per frame.
  maskPixels.data.fill(255);

  const segmenter = needsMask(effect) ? await loadSegmenter(assetBase) : null;
  let segmenterReady: ImageSegmenter | null = segmenter;
  let lastTimestamp = -1;

  const onMask = (result: ImageSegmenterResult): void => {
    const masks = result.confidenceMasks;
    if (!masks || masks.length === 0) return;
    // Two-class models list background first; a single mask is the person.
    const personMask = masks.length > 1 ? masks[1] : masks[0];
    if (!personMask) return;
    const values = personMask.getAsFloat32Array();
    const data = maskPixels.data;
    for (let i = 0, j = 3; i < values.length; i++, j += 4) {
      data[j] = (values[i] ?? 0) * 255;
    }
    maskCtx.putImageData(maskPixels, 0, 0);
  };

  const paintBackground = (): void => {
    const bg = CAMERA_BACKGROUNDS[effect.background];
    switch (bg.kind) {
      case "blur": {
        ctx.filter = `blur(${BLUR_PX}px)`;
        // Drawn a little larger so the blur's transparent fringe stays out.
        const pad = BLUR_PX * 2;
        ctx.drawImage(video, -pad, -pad, width + pad * 2, height + pad * 2);
        ctx.filter = "none";
        return;
      }
      case "color":
        ctx.fillStyle = bg.color;
        ctx.fillRect(0, 0, width, height);
        return;
      case "gradient": {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, bg.from);
        gradient.addColorStop(1, bg.to);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        return;
      }
      default:
        return;
    }
  };

  const draw = (now: number): void => {
    const filter = CAMERA_FILTERS[effect.filter].css || "none";
    if (!needsMask(effect) || !segmenterReady) {
      ctx.filter = filter;
      ctx.drawImage(video, 0, 0, width, height);
      ctx.filter = "none";
      return;
    }
    smallCtx.drawImage(video, 0, 0, MASK_WIDTH, maskHeight);
    // Timestamps must strictly increase or the segmenter rejects the frame.
    const timestamp = Math.max(Math.floor(now), lastTimestamp + 1);
    lastTimestamp = timestamp;
    try {
      segmenterReady.segmentForVideo(small, timestamp, onMask);
    } catch {
      // A failed frame reuses the previous mask.
    }
    paintBackground();
    personCtx.globalCompositeOperation = "source-over";
    personCtx.filter = filter;
    personCtx.drawImage(video, 0, 0, width, height);
    personCtx.filter = "none";
    personCtx.globalCompositeOperation = "destination-in";
    personCtx.drawImage(mask, 0, 0, width, height);
    ctx.drawImage(person, 0, 0);
  };

  let stopped = false;
  let frameHandle = 0;
  const useFrameCallback =
    typeof video.requestVideoFrameCallback === "function";
  const loop = (): void => {
    if (stopped) return;
    draw(performance.now());
    frameHandle = useFrameCallback
      ? video.requestVideoFrameCallback(loop)
      : requestAnimationFrame(loop);
  };
  loop();

  const track = out.captureStream(FPS).getVideoTracks()[0];
  if (!track) throw new Error("camera effects: canvas gave no track");
  const stream = new MediaStream([track, ...source.getAudioTracks()]);

  return {
    stream,
    setEffect: (next) => {
      effect = next;
      if (needsMask(next) && !segmenterReady) {
        void loadSegmenter(assetBase).then((s) => {
          if (!stopped) segmenterReady = s;
        });
      }
    },
    stop: () => {
      stopped = true;
      if (useFrameCallback) video.cancelVideoFrameCallback(frameHandle);
      else cancelAnimationFrame(frameHandle);
      track.stop();
      video.pause();
      video.srcObject = null;
    },
  };
}
