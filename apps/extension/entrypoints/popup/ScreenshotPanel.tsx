import { useState } from "react";
import { Button, Spinner, Typography } from "@heroui/react";
import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import { uploadScreenshot } from "@/lib/api/screenshot";
import { friendlyUploadError, isAuthFailure } from "@/lib/api/errors";
import { sendMessage } from "@/lib/messaging";
import { isOverlaySurface } from "@/lib/surface";
import { ResultLink } from "./RecorderPanel";

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

  const isBusy = state.kind === "busy";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5 rounded-xl bg-surface px-3 py-2.5">
        <span className="flex text-foreground" aria-hidden>
          {TAB_ICON}
        </span>
        <Typography type="body-sm" weight="medium" className="flex-1">
          Current tab
        </Typography>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        isDisabled={isBusy}
        onPress={() => void capture()}
      >
        {isBusy && <Spinner size="sm" color="current" />}
        {isBusy ? "Capturing…" : "Capture Screenshot"}
      </Button>

      {state.kind === "done" && (
        <ResultLink url={state.viewUrl} label="Your screenshot link is ready" />
      )}
      {state.kind === "error" && (
        <Typography type="body-xs" className="text-danger">
          {state.detail}
        </Typography>
      )}
    </div>
  );
}
