import { sendMessage } from "@/lib/messaging";
import {
  getRecordingStatus,
  watchRecordingStatus,
  type RecordingStatus,
} from "@/lib/storage";
import { formatClock } from "@/lib/format";
import { MAX_DURATION_MS } from "@/lib/capture/limits";

const HOST_ID = "captureflow-control-bar";

const STOP_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="3" fill="#f0554f"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="7" y="5" width="3.5" height="14" rx="1.5" fill="currentColor"/><rect x="13.5" y="5" width="3.5" height="14" rx="1.5" fill="currentColor"/></svg>`;
const RESUME_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.7v12.6c0 .8.9 1.3 1.6.9l10-6.3c.6-.4.6-1.4 0-1.8l-10-6.3c-.7-.4-1.6.1-1.6.9z" fill="currentColor"/></svg>`;
const RESTART_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5V2.5L7.5 6 12 9.5V7a5.5 5.5 0 1 1-5.5 5.5H4.5A7.5 7.5 0 1 0 12 5z" fill="currentColor"/></svg>`;
const DELETE_ICON = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M9 3h6l1 2h4v2H4V5h4l1-2zm-2.5 6h11l-.8 11.1a2 2 0 0 1-2 1.9H9.3a2 2 0 0 1-2-1.9L6.5 9zm4 2.5v7h1.5v-7h-1.5zm3 0v7H15v-7h-1.5z" fill="currentColor"/></svg>`;

const BAR_CSS = `
  .bar {
    position: fixed;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 8px;
    border-radius: 16px;
    background: #16181d;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.45);
    font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
    color: #e8eaed;
    cursor: grab;
    user-select: none;
  }
  .bar.dragging { cursor: grabbing; }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: #e8eaed;
    cursor: pointer;
    padding: 0;
  }
  button:hover { background: #2a2e36; }
  button:disabled { opacity: 0.4; cursor: default; }
  button:disabled:hover { background: transparent; }
  .stop { background: #2a2e36; }
  .stop:hover { background: #363b45; }
  .timer {
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    color: #e8eaed;
    padding: 2px 0 4px;
  }
  .timer.saving { font-size: 10px; color: #9aa0aa; }
`;

type Bar = {
  update(status: RecordingStatus): void;
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
  bar.className = "bar";
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

  bar.append(stop, timer, pause, restart, del);
  makeDraggable(host, bar);
  document.documentElement.appendChild(host);

  let current: RecordingStatus = { kind: "idle" };
  const renderTimer = (): void => {
    if (current.kind === "recording" || current.kind === "paused") {
      const elapsed =
        (current.kind === "paused" ? current.pausedAt : Date.now()) -
        current.startedAt -
        current.pausedMs;
      timer.textContent = formatClock(MAX_DURATION_MS - elapsed);
    }
  };
  const tick = setInterval(renderTimer, 500);

  return {
    update(status: RecordingStatus) {
      current = status;
      const saving = status.kind === "uploading";
      paused = status.kind === "paused";
      pause.innerHTML = paused ? RESUME_ICON : PAUSE_ICON;
      pause.title = paused ? "Resume" : "Pause";
      for (const button of [stop, pause, restart, del]) {
        button.disabled = saving;
      }
      timer.classList.toggle("saving", saving);
      if (saving) {
        timer.textContent = "Saving…";
      } else {
        renderTimer();
      }
    },
    destroy() {
      clearInterval(tick);
      host.remove();
    },
  };
}

export default defineContentScript({
  matches: ["http://*/*", "https://*/*"],
  main() {
    let bar: Bar | null = null;
    const apply = (status: RecordingStatus): void => {
      const visible =
        status.kind === "recording" ||
        status.kind === "paused" ||
        status.kind === "uploading";
      if (!visible) {
        bar?.destroy();
        bar = null;
        return;
      }
      bar ??= createBar();
      bar.update(status);
    };
    void getRecordingStatus().then(apply);
    watchRecordingStatus(apply);
  },
});
