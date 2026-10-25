/*
 * Dev builds only: a timeline of what the capture sources did, printed to the
 * offscreen document's console. Reads one recording's first seconds: whether a
 * source stopped delivering (mute), how long each track went without a frame,
 * and whether the main thread was blocked meanwhile.
 */
const FRAME_GAP_MS = 250;
const LONG_TASK_MS = 100;
const HEARTBEAT_MS = 50;

type Stop = () => void;

export function startCaptureDiagnostics(
  screen: MediaStream,
  webcam: MediaStream | null,
): Stop {
  const t0 = performance.now();
  const at = () => `${((performance.now() - t0) / 1000).toFixed(2)}s`;
  const stops: Stop[] = [];
  console.info(`[capture] diagnostics on at ${new Date().toISOString()}`);

  for (const [name, stream] of [
    ["screen", screen],
    ["camera", webcam],
  ] as const) {
    const track = stream?.getVideoTracks()[0];
    if (!track) continue;
    const s = track.getSettings();
    console.info(
      `[capture] ${name} track ${s.width}x${s.height}@${s.frameRate} muted=${track.muted}`,
    );
    const onMute = () => console.warn(`[capture] ${name} MUTED at ${at()}`);
    const onUnmute = () => console.warn(`[capture] ${name} unmuted at ${at()}`);
    const onEnded = () => console.warn(`[capture] ${name} ended at ${at()}`);
    track.addEventListener("mute", onMute);
    track.addEventListener("unmute", onUnmute);
    track.addEventListener("ended", onEnded);
    stops.push(() => {
      track.removeEventListener("mute", onMute);
      track.removeEventListener("unmute", onUnmute);
      track.removeEventListener("ended", onEnded);
    });
    stops.push(watchFrameGaps(name, track, at));
  }

  // Longtask entries don't reach offscreen documents, so a timer stands in:
  // a late tick means the main thread was busy since the previous one.
  let lastTick = performance.now();
  const heartbeat = setInterval(() => {
    const now = performance.now();
    const late = now - lastTick - HEARTBEAT_MS;
    if (late >= LONG_TASK_MS) {
      const since = new Date(Date.now() - (now - lastTick)).toISOString();
      console.warn(
        `[capture] main thread busy ${Math.round(late)}ms since ${since}, free at ${at()}`,
      );
    }
    lastTick = now;
  }, HEARTBEAT_MS);
  stops.push(() => clearInterval(heartbeat));

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration >= LONG_TASK_MS) {
          console.warn(
            `[capture] main thread blocked ${Math.round(entry.duration)}ms at ${((entry.startTime - t0) / 1000).toFixed(2)}s`,
          );
        }
      }
    });
    observer.observe({ entryTypes: ["longtask"] });
    stops.push(() => observer.disconnect());
  } catch {
    /* no longtask support */
  }

  return () => {
    for (const stop of stops) stop();
    console.info(`[capture] diagnostics off at ${at()}`);
  };
}

// A second reader on the track sees every frame the recorder sees.
function watchFrameGaps(
  name: string,
  track: MediaStreamTrack,
  at: () => string,
): Stop {
  let stopped = false;
  let reader: ReadableStreamDefaultReader<VideoFrame> | null = null;
  try {
    reader = new MediaStreamTrackProcessor({
      track,
    } as MediaStreamTrackProcessorInit).readable.getReader();
  } catch {
    return () => {};
  }
  void (async () => {
    let last = performance.now();
    let frames = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done || !value || stopped) {
        value?.close();
        break;
      }
      const now = performance.now();
      if (now - last > FRAME_GAP_MS) {
        const since = new Date(Date.now() - (now - last)).toISOString();
        console.warn(
          `[capture] ${name}: no frame for ${Math.round(now - last)}ms since ${since}, resumed at ${at()} (frame ${frames})`,
        );
      }
      last = now;
      frames++;
      if (frames === 1)
        console.info(`[capture] ${name}: first frame at ${at()}`);
      value.close();
    }
  })();
  return () => {
    stopped = true;
    void reader.cancel().catch(() => {});
  };
}
