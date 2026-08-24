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
// being scaled up. Cameras ramp to their real resolution over the first frames.
const SHARP_WIDTH = 440;
const SHARP_WAIT_MS = 800;

/*
 * Holds the spinner until frames are worth showing. `playing` fires on the
 * first frame of all, which on most cameras is well below the resolution they
 * settle at — revealing there showed a pixelated bubble that sharpened a beat
 * later. The deadline is what covers a camera that never reaches SHARP_WIDTH.
 */
function revealWhenSharp(video: HTMLVideoElement, reveal: () => void): void {
  // A timer, not a deadline checked inside the callback: a callback that never
  // fires would leave the bubble spinning forever.
  const deadline = setTimeout(reveal, SHARP_WAIT_MS);
  const done = () => {
    clearTimeout(deadline);
    reveal();
  };
  if (typeof video.requestVideoFrameCallback !== "function") {
    done();
    return;
  }
  const check = () => {
    if (video.videoWidth >= SHARP_WIDTH) {
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
    video.addEventListener("playing", () => revealWhenSharp(video, settle), {
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
