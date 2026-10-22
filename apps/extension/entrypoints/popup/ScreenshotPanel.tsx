import { useState } from "react";
import { Button, Spinner, Typography } from "@heroui/react";
import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import { uploadScreenshot } from "@/lib/api/screenshot";
import { friendlyUploadError, isAuthFailure } from "@/lib/api/errors";
import { sendMessage } from "@/lib/messaging";
import { isOverlaySurface } from "@/lib/surface";
import { ResultLink } from "./RecorderPanel";
import { PANEL_ROW_GREY } from "./panel";

type ShotState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "done"; viewUrl: string }
  | { kind: "error"; detail: string };

const TAB_ICON = (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
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

/*
 * captureVisibleTab needs activeTab, which Chrome grants only when the user
 * opens the extension on that tab (toolbar icon or shortcut). Opened from the
 * dashboard's record button, the panel has no grant and Chrome's own message
 * names permissions the user can't act on.
 */
const NO_TAB_GRANT = /'<all_urls>' or 'activeTab' permission/;

function screenshotError(err: unknown): string {
  return err instanceof Error && NO_TAB_GRANT.test(err.message)
    ? "To capture this tab, open CaptureFlow from its icon in the toolbar, then press Capture Screenshot."
    : friendlyUploadError(err);
}

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
      setState({ kind: "error", detail: screenshotError(err) });
    }
  };

  const isBusy = state.kind === "busy";

  return (
    <div className="flex flex-col gap-4">
      <div className={PANEL_ROW_GREY}>
        <span className="flex text-foreground" aria-hidden>
          {TAB_ICON}
        </span>
        <span className="flex-1 truncate">Current tab</span>
      </div>

      <Button
        variant="primary"
        fullWidth
        isDisabled={isBusy}
        onPress={() => void capture()}
        className="h-[50px] rounded-[14px] border border-separator text-[15px] font-semibold"
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
