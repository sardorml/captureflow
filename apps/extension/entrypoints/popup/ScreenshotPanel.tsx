import { useState } from "react";
import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import { uploadScreenshot } from "@/lib/api/screenshot";
import { friendlyUploadError, isAuthFailure } from "@/lib/api/errors";
import { sendMessage } from "@/lib/messaging";
import { isOverlaySurface } from "@/lib/surface";

type ShotState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done"; viewUrl: string }
  | { kind: "error"; detail: string };

const TAB_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
    <rect
      x="3"
      y="4.5"
      width="18"
      height="15"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

export function ScreenshotPanel() {
  const [state, setState] = useState<ShotState>({ kind: "idle" });
  const [copied, setCopied] = useState(false);

  const capture = async () => {
    setState({ kind: "busy" });
    try {
      const session = await getAuthSession();
      if (!session) throw new Error("Sign in to capture.");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      // The overlay (blur + panel) must not end up inside the capture.
      let dataUrl: string;
      if (isOverlaySurface) {
        await sendMessage("setOverlayVisible", { visible: false });
        await new Promise((resolve) => setTimeout(resolve, 150));
        try {
          dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
        } finally {
          void sendMessage("setOverlayVisible", { visible: true });
        }
      } else {
        dataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
      }
      const png = await (await fetch(dataUrl)).blob();
      const bitmap = await createImageBitmap(png);
      const deviceId = await getDeviceId();
      const res = await uploadScreenshot(deviceId, session.token, {
        png,
        width: bitmap.width,
        height: bitmap.height,
        title: tab?.title ?? undefined,
      });
      bitmap.close();
      setState({ kind: "done", viewUrl: res.viewUrl });
      await chrome.tabs.create({ url: res.viewUrl });
    } catch (err) {
      if (isAuthFailure(err)) await setAuthSession(null);
      setState({ kind: "error", detail: friendlyUploadError(err) });
    }
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the link is still tappable */
    }
  };

  return (
    <>
      <section className="cf-section">
        <div className="cf-row">
          <span className="cf-row-icon" aria-hidden>
            {TAB_ICON}
          </span>
          <span className="cf-row-label">Current tab</span>
        </div>
      </section>

      <button
        type="button"
        className="cf-start"
        onClick={() => void capture()}
        disabled={state.kind === "busy"}
      >
        {state.kind === "busy" ? "Capturing…" : "Capture Screenshot"}
      </button>

      {state.kind === "done" && (
        <div className="cf-result">
          <p className="cf-status cf-status--ok">
            Your screenshot link is ready ✓
          </p>
          <div className="cf-linkrow">
            <a
              className="cf-link"
              href={state.viewUrl}
              target="_blank"
              rel="noreferrer"
            >
              {state.viewUrl}
            </a>
            <button
              type="button"
              className="cf-copy"
              onClick={() => void copy(state.viewUrl)}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      )}
      {state.kind === "error" && (
        <p className="cf-status cf-status--error">{state.detail}</p>
      )}
    </>
  );
}
