import { sendMessage } from "@/lib/messaging";

// getUserMedia here seeds the grant the offscreen recorder reuses; the mic
// track is released since only the camera is previewed.
const audio = new URLSearchParams(location.search).get("audio") === "1";

async function run(): Promise<void> {
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

void run();
