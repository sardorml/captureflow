// Camera/mic getUserMedia only prompts from a visible page — not the popup or
// the offscreen document — so this page exists solely to acquire the grant. It
// runs either as a hidden iframe injected into the active tab (the normal path)
// or as a standalone fallback tab on restricted pages. Once granted, the
// offscreen recorder can use getUserMedia silently.
import { PERMISSION_MESSAGE_SOURCE } from "@/lib/permissions/handshake";

const inFrame = window.parent !== window;

function setMessage(title: string, status: string): void {
  const titleEl = document.getElementById("title");
  const statusEl = document.getElementById("status");
  if (titleEl) titleEl.textContent = title;
  if (statusEl) statusEl.textContent = status;
}

async function closeSelf(): Promise<void> {
  const tab = await chrome.tabs.getCurrent();
  if (tab?.id !== undefined) await chrome.tabs.remove(tab.id);
}

// Injected as an iframe → ask the host page's content script to remove us;
// opened as a fallback tab → close the tab on success.
function done(ok: boolean): void {
  if (inFrame) {
    window.parent.postMessage({ source: PERMISSION_MESSAGE_SOURCE, ok }, "*");
  } else if (ok) {
    setTimeout(() => void closeSelf(), 1200);
  }
}

async function run(): Promise<void> {
  const params = new URLSearchParams(location.search);
  const video = params.get("video") === "1";
  const audio = params.get("audio") === "1";
  if (!video && !audio) {
    setMessage("Nothing to enable", "You can close this tab.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video, audio });
    for (const track of stream.getTracks()) track.stop();
    setMessage(
      "Access granted ✓",
      "CaptureFlow can now record your camera and microphone. Closing…",
    );
    done(true);
  } catch {
    setMessage(
      "Access was blocked",
      "Allow camera & microphone for this extension in your browser settings, then try again.",
    );
    done(false);
  }
}

void run();
