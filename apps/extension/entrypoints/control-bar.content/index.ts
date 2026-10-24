import { onMessage, sendMessage } from "@/lib/messaging";
import {
  getRecordingStatus,
  watchRecordingStatus,
  type RecordingStatus,
} from "@/lib/storage";
import { formatClock } from "@/lib/format";
import {
  CONTROL_BAR_HOST_ID,
  RECORDER_FRAME_ID,
} from "@/lib/overlay/recorder-overlay";
import {
  BUBBLE_FRAME_ID,
  unmountCameraBubble,
} from "@/lib/overlay/camera-bubble";
import {
  RECORDING_BUBBLE_SIZE,
  requestRecordingWindow,
} from "@/lib/overlay/recording-window";

const HOST_ID = CONTROL_BAR_HOST_ID;

// Long enough to take the controls in at the start; short enough after the
// pointer leaves that the bar doesn't linger open.
const START_FOLD_MS = 2500;
const LEAVE_FOLD_MS = 300;
// Outlasts the exit transition.
const LEAVE_MS = 240;

// Each icon is drawn at the pixel size it measures in the reference, so the
// glyph is the box: a 17px stop square, 15×17 pause bars, a 20px restart
// ring, a 15px cross.
const STOP_ICON = `<svg viewBox="0 0 17 17" width="17" height="17" aria-hidden="true"><rect width="17" height="17" rx="4" fill="currentColor"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 15 17" width="15" height="17" aria-hidden="true"><rect width="6" height="17" rx="1.5" fill="currentColor"/><rect x="9" width="6" height="17" rx="1.5" fill="currentColor"/></svg>`;
const RESUME_ICON = `<svg viewBox="0 0 15 17" width="15" height="17" aria-hidden="true"><path d="M1.5 1.6v13.8c0 .9 1 1.4 1.7.9l11-6.9c.7-.4.7-1.4 0-1.8l-11-6.9c-.7-.5-1.7 0-1.7.9z" fill="currentColor"/></svg>`;
const RESTART_ICON = `<svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><path d="M2.5 10a7.5 7.5 0 1 0 2.3-5.4M2 2.6v4.6h4.6" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const DELETE_ICON = `<svg viewBox="0 0 15 15" width="15" height="15" aria-hidden="true"><path d="M1.5 1.5l12 12M13.5 1.5l-12 12" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>`;

/*
 * Measured off the reference bar at 2x: 58px wide with a 1px border and 20px
 * corners; 36px controls, the stop in its own lighter well; the clock a 36px
 * band between stop and pause, then an 8px gap between the icon buttons. Its
 * preview greys are the colours below; live, the controls read brighter.
 */
const BAR_CSS = `
  .bar {
    position: fixed;
    left: 16px;
    top: 42%;
    transform: translateY(-50%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 10px;
    border: 1px solid #3b3d42;
    border-radius: 20px;
    background: #292a2e;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    color: #f2f3f5;
    cursor: grab;
    user-select: none;
  }
  .bar.dragging { cursor: grabbing; }
  /* Slides in from its edge; the same path out. */
  .bar.entering, .bar.leaving {
    opacity: 0;
    transform: translate(-12px, -50%);
    transition: opacity 0.18s ease-out, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .bar.settled {
    transition: opacity 0.18s ease-out, transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  @media (prefers-reduced-motion: reduce) {
    .bar.entering, .bar.leaving, .bar.settled { transition: none; }
  }
  /* A ring pulses out twice when the toolbar is clicked mid-recording. */
  .bar.nudge { animation: nudge 0.8s ease-out 2; }
  @keyframes nudge {
    from { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 0 rgba(236, 94, 59, 0.8); }
    to { box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45), 0 0 0 16px rgba(236, 94, 59, 0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .bar.nudge { animation: none; }
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: #c9cbd1;
    cursor: pointer;
    padding: 0;
  }
  button + button { margin-top: 8px; }
  button:hover { background: #36373c; color: #f2f3f5; }
  button:disabled { color: #585a60; cursor: default; }
  button:disabled:hover { background: transparent; }
  .stop { background: #404146; color: #d0d2d8; }
  .stop:hover { background: #4a4b51; color: #f2f3f5; }
  .stop:disabled { color: #6a6b72; }
  .stop:disabled:hover { background: #404146; }
  .bar.live .stop { background: #ec5e3b; color: #fff; }
  .bar.live .stop:hover { background: #d9512f; }
  /* Restart and delete sit in a row that folds shut a moment after the
     recording starts and unfolds under the pointer. */
  .extra {
    display: grid;
    grid-template-rows: 1fr;
    opacity: 1;
    transition: grid-template-rows 0.22s ease, opacity 0.18s ease;
  }
  .extra > div {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }
  .extra button { margin-top: 8px; }
  .bar.collapsed .extra { grid-template-rows: 0fr; opacity: 0; }
  @media (prefers-reduced-motion: reduce) {
    .extra { transition: none; }
  }
  .timer {
    display: flex;
    align-items: center;
    height: 36px;
    font-size: 12px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: #f2f3f5;
  }
  .timer.preview { color: #96989d; }
`;

// The recording window: just the camera bubble.
const WINDOW_CSS = `
  html, body { margin: 0; height: 100%; }
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
    background: #16181d;
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
  .note {
    margin: 0;
    font-size: 12px;
    line-height: 20px;
    color: #96989d;
    text-align: center;
    white-space: nowrap;
  }
  .bubble {
    position: relative;
    flex: none;
    width: ${RECORDING_BUBBLE_SIZE}px;
    height: ${RECORDING_BUBBLE_SIZE}px;
    border-radius: 50%;
    overflow: hidden;
    background: #16181d;
  }
  .bubble iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 50%;
  }
`;

type RecordingWindow = {
  window: Window;
  bubble: HTMLIFrameElement;
  live: boolean;
};

type Bar = {
  update(status: RecordingStatus): void;
  // Shown while the panel is open: every control disabled, clock at zero.
  preview(): void;
  nudge(): void;
  destroy(): void;
};

function iconButton(icon: string, title: string, onClick: () => void) {
  const button = document.createElement("button");
  button.type = "button";
  button.title = title;
  button.innerHTML = icon;
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    onClick();
  });
  // Keep button presses from starting a bar drag.
  button.addEventListener("pointerdown", (event) => event.stopPropagation());
  return button;
}

function makeDraggable(host: HTMLElement, bar: HTMLElement): void {
  bar.addEventListener("pointerdown", (event) => {
    const rect = bar.getBoundingClientRect();
    const dx = event.clientX - rect.left;
    const dy = event.clientY - rect.top;
    bar.classList.add("dragging");
    const move = (ev: PointerEvent) => {
      bar.style.left = `${Math.max(0, ev.clientX - dx)}px`;
      bar.style.top = `${Math.max(0, ev.clientY - dy)}px`;
      bar.style.transform = "none";
    };
    const up = () => {
      bar.classList.remove("dragging");
      host.ownerDocument.removeEventListener("pointermove", move);
      host.ownerDocument.removeEventListener("pointerup", up);
    };
    host.ownerDocument.addEventListener("pointermove", move);
    host.ownerDocument.addEventListener("pointerup", up);
  });
}

function createBar(): Bar {
  const host = document.createElement("div");
  host.id = HOST_ID;
  const shadow = host.attachShadow({ mode: "closed" });

  const style = document.createElement("style");
  style.textContent = BAR_CSS;
  shadow.appendChild(style);

  const bar = document.createElement("div");
  bar.className = "bar entering";
  shadow.appendChild(bar);

  const stop = iconButton(STOP_ICON, "Stop and save", () =>
    sendMessage("stopRecording", undefined),
  );
  stop.classList.add("stop");

  const timer = document.createElement("div");
  timer.className = "timer";

  let paused = false;
  const pause = iconButton(PAUSE_ICON, "Pause", () =>
    sendMessage(paused ? "resumeRecording" : "pauseRecording", undefined),
  );
  const restart = iconButton(RESTART_ICON, "Restart recording", () =>
    sendMessage("restartRecording", undefined),
  );
  const del = iconButton(DELETE_ICON, "Delete recording", () =>
    sendMessage("deleteRecording", undefined),
  );

  const extra = document.createElement("div");
  extra.className = "extra";
  const extraInner = document.createElement("div");
  extraInner.append(restart, del);
  extra.appendChild(extraInner);
  bar.append(stop, timer, pause, extra);
  makeDraggable(host, bar);
  document.documentElement.appendChild(host);
  // Two frames in: the first paints the start state, the second transitions.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => bar.classList.replace("entering", "settled")),
  );

  // Full at the start so the controls are seen once, folded after that,
  // and open again for as long as the pointer is over the bar.
  let collapseTimer: ReturnType<typeof setTimeout> | undefined;
  const expand = (): void => {
    clearTimeout(collapseTimer);
    bar.classList.remove("collapsed");
  };
  const collapseAfter = (ms: number): void => {
    clearTimeout(collapseTimer);
    collapseTimer = setTimeout(() => bar.classList.add("collapsed"), ms);
  };
  bar.addEventListener("pointerenter", expand);
  bar.addEventListener("pointerleave", () => {
    if (bar.classList.contains("live")) collapseAfter(LEAVE_FOLD_MS);
  });

  let current: RecordingStatus = { kind: "idle" };
  const renderTimer = (): void => {
    if (current.kind === "recording" || current.kind === "paused") {
      const elapsed =
        (current.kind === "paused" ? current.pausedAt : Date.now()) -
        current.startedAt -
        current.pausedMs;
      // Counts up: there is no deadline to count down to any more.
      timer.textContent = formatClock(elapsed);
    }
  };
  const tick = setInterval(renderTimer, 500);

  return {
    preview() {
      current = { kind: "idle" };
      bar.classList.remove("live");
      expand();
      pause.innerHTML = PAUSE_ICON;
      pause.title = "Pause";
      for (const button of [stop, pause, restart, del]) {
        button.disabled = true;
      }
      timer.classList.add("preview");
      timer.textContent = formatClock(0);
    },
    update(status: RecordingStatus) {
      current = status;
      if (!bar.classList.contains("live")) {
        bar.classList.add("live");
        expand();
        collapseAfter(START_FOLD_MS);
      }
      paused = status.kind === "paused";
      pause.innerHTML = paused ? RESUME_ICON : PAUSE_ICON;
      pause.title = paused ? "Resume" : "Pause";
      for (const button of [stop, pause, restart, del]) {
        button.disabled = false;
      }
      timer.classList.remove("preview");
      renderTimer();
    },
    nudge() {
      expand();
      collapseAfter(START_FOLD_MS);
      bar.classList.remove("nudge");
      // Forces a reflow so a second click restarts the animation.
      void bar.offsetWidth;
      bar.classList.add("nudge");
      bar.addEventListener(
        "animationend",
        () => bar.classList.remove("nudge"),
        { once: true },
      );
    },
    destroy() {
      clearInterval(tick);
      clearTimeout(collapseTimer);
      // The id goes at once, so a bar created meanwhile is the one found.
      host.id = "";
      // A dragged bar has lost its centring transform; it fades in place.
      if (bar.style.transform === "none") bar.style.opacity = "0";
      else bar.classList.add("leaving");
      setTimeout(() => host.remove(), LEAVE_MS);
    },
  };
}

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    let bar: Bar | null = null;
    let previewing = false;
    let recordingWindow: RecordingWindow | null = null;

    const closeRecordingWindow = (): void => {
      const open = recordingWindow;
      if (!open) return;
      recordingWindow = null;
      open.window.close();
    };

    const apply = (status: RecordingStatus): void => {
      // The bar leaves with the recording: the upload has its own page.
      const live = status.kind === "recording" || status.kind === "paused";
      if (live) {
        bar ??= createBar();
        bar.update(status);
        // The camera comes up once the recorder holds it; opening the same
        // device first can cost the recorder its webcam track.
        if (recordingWindow && !recordingWindow.live) {
          recordingWindow.live = true;
          recordingWindow.bubble.src = chrome.runtime.getURL(
            "bubble.html?camera=1",
          );
        }
        return;
      }
      if (previewing) {
        bar ??= createBar();
        bar.preview();
        return;
      }
      bar?.destroy();
      bar = null;
      // The window opens on the Start press and waits out the picker and the
      // countdown; anything but a recording in the making closes it.
      if (status.kind !== "preparing") closeRecordingWindow();
      // A leftover page bubble goes with the bar; the panel's preview bubble
      // is the panel's to remove.
      unmountCameraBubble(BUBBLE_FRAME_ID);
    };
    void getRecordingStatus().then(apply);
    watchRecordingStatus(apply);

    onMessage("openRecordingWindow", async () => {
      if (recordingWindow) return true;
      const win = await requestRecordingWindow();
      if (!win) return false;
      const doc = win.document;
      const style = doc.createElement("style");
      style.textContent = WINDOW_CSS;
      doc.head.appendChild(style);
      const circle = doc.createElement("div");
      circle.className = "bubble";
      const bubble = doc.createElement("iframe");
      bubble.src = chrome.runtime.getURL("bubble.html");
      bubble.allow = "camera; microphone";
      circle.appendChild(bubble);
      const note = doc.createElement("p");
      note.className = "note";
      note.textContent = "You can move the camera after recording.";
      doc.body.append(circle, note);
      recordingWindow = { window: win, bubble, live: false };
      win.addEventListener("pagehide", () => {
        if (recordingWindow?.window === win) recordingWindow = null;
      });
      return true;
    });

    // The panel's frame leaving the page ends the preview too, so a worker
    // asleep at the close can't strand the bar.
    const frameWatch = new MutationObserver(() => {
      if (document.getElementById(RECORDER_FRAME_ID)) return;
      frameWatch.disconnect();
      previewing = false;
      void getRecordingStatus().then(apply);
    });
    onMessage("nudgeControlBar", () => bar?.nudge());
    onMessage("panelPreview", ({ data }) => {
      previewing = data;
      frameWatch.disconnect();
      if (data) {
        frameWatch.observe(document.documentElement, { childList: true });
      }
      void getRecordingStatus().then(apply);
    });
  },
});
