import { sendMessage } from "@/lib/messaging";

/*
 * Two modes, both seeding the extension-origin grant the offscreen recorder
 * reuses:
 *   preview (default) — live circular camera; the mic track is released since
 *     only the camera is previewed.
 *   grant=1 — invisible frame that asks for camera+mic in ONE native prompt
 *     and releases everything; the SW tears the frame down on the result
 *     message.
 */
const params = new URLSearchParams(location.search);
const audio = params.get("audio") === "1";
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

// The bubble is 220 CSS px, so a frame narrower than this on a 2x display is
// being scaled up.
const SHARP_WIDTH = 440;
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

async function runPreview(): Promise<void> {
  const video = document.getElementById("cam");
  if (!(video instanceof HTMLVideoElement)) return;
  // Also settles on failure, so a blocked camera doesn't spin forever.
  const settle = () => document.body.setAttribute("data-state", "ready");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio,
    });
    for (const track of stream.getAudioTracks()) track.stop();
    video.addEventListener("playing", () => revealWhenSettled(video, settle), {
      once: true,
    });
    video.srcObject = stream;
    void sendMessage("cameraStatus", { blocked: false });
  } catch {
    settle();
    void sendMessage("cameraStatus", { blocked: true });
  }
}

void (grantOnly ? runGrant() : runPreview());
