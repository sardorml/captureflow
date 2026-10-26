import {
  RECORDING_QUALITIES,
  hydrateRecordingQuality,
} from "@captureflow/engine";
import { sendMessage } from "@/lib/messaging";
import {
  getUserProfile,
  watchUserProfile,
  type UserProfile,
} from "@/lib/auth/session";
import { initials } from "@/lib/format";
import { avatarUrlAt } from "@/lib/avatar";
import { getCapturePrefs, watchCapturePrefs } from "@/lib/storage";
import {
  createCameraEffectStream,
  type CameraEffectStream,
} from "@/lib/capture/camera-effect-stream";
import {
  hydrateCameraEffect,
  isPlainCameraEffect,
} from "@/lib/capture/camera-effects";

/*
 * Three modes; the first two seed the extension-origin grant the offscreen
 * recorder reuses:
 *   camera=1 — live circular camera; the mic track is released since only the
 *     camera is previewed.
 *   grant=1 — invisible frame that asks for camera+mic in ONE native prompt
 *     and releases everything; the SW tears the frame down on the result
 *     message.
 *   neither — a placeholder standing where the camera will be while it's off.
 */
const params = new URLSearchParams(location.search);
const audio = params.get("audio") === "1";
const camera = params.get("camera") === "1";
const grantOnly = params.get("grant") === "1";

async function isCameraDenied(): Promise<boolean> {
  try {
    const perm = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return perm.state === "denied";
  } catch {
    return false;
  }
}

async function runGrant(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    for (const track of stream.getTracks()) track.stop();
    void sendMessage("mediaGrantResult", { granted: true, denied: false });
  } catch {
    // A dismissed prompt is not a Block — only a real denial flags the camera.
    void sendMessage("mediaGrantResult", {
      granted: false,
      denied: await isCameraDenied(),
    });
  }
}

const BUBBLE_SIZE = 220;
// A frame narrower than the bubble on a 2x display is being scaled up.
const SHARP_WIDTH = BUBBLE_SIZE * 2;
// Checked on delivered frames, so a camera that has stopped producing them
// waits for the cap rather than revealing a stale one. Raise it if the first
// look at the bubble is still soft; it costs spinner time and nothing else.
const SETTLE_MS = 900;
const MAX_WAIT_MS = 2500;

/*
 * Holds the spinner until the picture is worth showing. `playing` fires on the
 * very first frame, and the camera spends the next moment converging: gain,
 * exposure, and denoising all settle after the resolution does, which is why
 * waiting on videoWidth alone did nothing. Nothing reports that convergence,
 * so this waits it out.
 */
function revealWhenSettled(video: HTMLVideoElement, reveal: () => void): void {
  // A timer, not a deadline checked inside the callback: a callback that never
  // fires would leave the bubble spinning forever.
  const cap = setTimeout(reveal, MAX_WAIT_MS);
  const done = () => {
    clearTimeout(cap);
    reveal();
  };
  if (typeof video.requestVideoFrameCallback !== "function") {
    setTimeout(done, SETTLE_MS);
    return;
  }
  const start = performance.now();
  const check = () => {
    if (
      performance.now() - start >= SETTLE_MS &&
      video.videoWidth >= SHARP_WIDTH
    ) {
      done();
      return;
    }
    video.requestVideoFrameCallback(check);
  };
  video.requestVideoFrameCallback(check);
}

/*
 * The preview shows the same effect the recorder will bake in. The pipeline
 * is started lazily, the first time an effect is picked, and from then on it
 * stays up so switching back to None doesn't blink the picture.
 */
function followEffects(video: HTMLVideoElement, raw: MediaStream): void {
  let pipeline: CameraEffectStream | null = null;
  let starting = false;
  const apply = async (prefsEffect: unknown): Promise<void> => {
    const effect = hydrateCameraEffect(prefsEffect);
    if (pipeline) {
      pipeline.setEffect(effect);
      return;
    }
    if (isPlainCameraEffect(effect) || starting) return;
    starting = true;
    try {
      pipeline = await createCameraEffectStream(
        raw,
        effect,
        chrome.runtime.getURL("mediapipe"),
      );
      video.srcObject = pipeline.stream;
    } catch {
      pipeline = null;
    } finally {
      starting = false;
    }
  };
  void getCapturePrefs().then((p) => apply(p.effect));
  watchCapturePrefs((p) => void apply(p.effect));
}

async function runPreview(): Promise<void> {
  const video = document.getElementById("cam");
  if (!(video instanceof HTMLVideoElement)) return;
  // Also settles on failure, so a blocked camera doesn't spin forever.
  const settle = () => document.body.setAttribute("data-state", "ready");
  try {
    const { cameraId, quality } = await getCapturePrefs();
    // The recorder holds the camera at the preset's size; asking for a larger
    // one here makes the browser restart the device, and on macOS that
    // stalls screen capture too for the first seconds of the recording.
    const { width, height } =
      RECORDING_QUALITIES[hydrateRecordingQuality(quality)].webcam;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: width },
        height: { ideal: height },
        ...(cameraId ? { deviceId: { ideal: cameraId } } : {}),
      },
      audio,
    });
    for (const track of stream.getAudioTracks()) track.stop();
    video.addEventListener("playing", () => revealWhenSettled(video, settle), {
      once: true,
    });
    video.srcObject = stream;
    followEffects(video, stream);
    void sendMessage("cameraStatus", { blocked: false });
  } catch {
    settle();
    void sendMessage("cameraStatus", { blocked: true });
  }
}

// The same identity the dashboard's account menu shows: the avatar when there
// is one, otherwise initials from the name, or the address.
function renderAvatar(profile: UserProfile | null): void {
  const avatar = document.getElementById("avatar");
  const image = document.getElementById("avatar-image");
  const text = document.getElementById("avatar-initials");
  if (!avatar || !(image instanceof HTMLImageElement) || !text) return;
  const displayName = profile?.name?.trim() || profile?.email || "";
  text.textContent = initials(displayName);
  if (profile?.image) {
    // The fixed size, not the element's: it has no width while still hidden.
    image.src = avatarUrlAt(profile.image, BUBBLE_SIZE * devicePixelRatio);
    avatar.dataset.hasImage = "true";
  } else {
    image.removeAttribute("src");
    avatar.dataset.hasImage = "false";
  }
}

async function showPlaceholder(): Promise<void> {
  renderAvatar(await getUserProfile());
  watchUserProfile(renderAvatar);
  document.body.setAttribute("data-mode", "placeholder");
  document.body.setAttribute("data-state", "ready");
}

void (grantOnly ? runGrant() : camera ? runPreview() : showPlaceholder());
