// Camera/mic getUserMedia only prompts from a visible page — not the popup or
// the offscreen document. The normal path is the in-page camera bubble; this
// standalone tab is the fallback for restricted pages (chrome://, the web store,
// the new tab) where the bubble can't be injected, and it still acquires the
// grant the offscreen recorder reuses.

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
    setTimeout(() => void closeSelf(), 1200);
  } catch {
    setMessage(
      "Access was blocked",
      "Allow camera & microphone for this extension in your browser settings, then try again.",
    );
  }
}

void run();
