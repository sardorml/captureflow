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

async function runPreview(): Promise<void> {
  const video = document.getElementById("cam");
  if (!(video instanceof HTMLVideoElement)) return;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio,
    });
    for (const track of stream.getAudioTracks()) track.stop();
    video.srcObject = stream;
    void sendMessage("cameraStatus", { blocked: false });
  } catch {
    void sendMessage("cameraStatus", { blocked: true });
  }
}

void (grantOnly ? runGrant() : runPreview());
