// The live camera preview bubble, shown as an injected iframe in the bottom-left
// of the active tab while the camera is on. Running here (extension origin) also
// grabs the camera/mic grant the offscreen recorder reuses, so on a normal page
// no separate permission prompt is needed. The mic is released immediately — the
// grant persists, and only the camera is previewed.
async function run(): Promise<void> {
  const audio = new URLSearchParams(location.search).get("audio") === "1";
  const video = document.getElementById("cam");
  const blocked = document.getElementById("blocked");
  if (!(video instanceof HTMLVideoElement)) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio,
    });
    for (const track of stream.getAudioTracks()) track.stop();
    video.srcObject = stream;
  } catch {
    video.style.display = "none";
    if (blocked) blocked.style.display = "flex";
  }
}

void run();
