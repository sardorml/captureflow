import { useEffect, useRef, useState } from "react";
import { Button, Spinner, Typography } from "@heroui/react";
import { getAuthSession, setAuthSession } from "@/lib/auth/session";
import { getDeviceId } from "@/lib/auth/device-id";
import { uploadScreenshot } from "@/lib/api/screenshot";
import { friendlyUploadError, isAuthFailure } from "@/lib/api/errors";
import { onMessage, sendMessage } from "@/lib/messaging";
import type { PageArea } from "@/lib/overlay/area-select";
import {
  getCapturePrefs,
  setCapturePrefs,
  watchCapturePrefs,
  type ScreenshotType,
} from "@/lib/storage";
import { isOverlaySurface } from "@/lib/surface";

type ShotState =
  | { kind: "idle" }
  | { kind: "busy" }
  | { kind: "error"; detail: string };

// Time for the page to repaint without the extension's chrome before the
// capture reads the screen.
const SETTLE_MS = 150;

const AREA_ICON = (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <path
      d="M4 9V6a2 2 0 0 1 2-2h3M15 4h3a2 2 0 0 1 2 2v3M20 15v3a2 2 0 0 1-2 2h-3M9 20H6a2 2 0 0 1-2-2v-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const TAB_ICON = (
  <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden>
    <rect
      x="3"
      y="6"
      width="18"
      height="12"
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>
);

const TYPES: { id: ScreenshotType; label: string; icon: React.ReactNode }[] = [
  { id: "area", label: "Custom area", icon: AREA_ICON },
  { id: "tab", label: "Current tab", icon: TAB_ICON },
];

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

/*
 * One runtime listener for the page, fanned out to whichever panel is
 * waiting: registering per mount would double up under StrictMode.
 */
const areaWaiters = new Set<(area: PageArea | null) => void>();
onMessage("areaSelected", ({ data }) => {
  for (const waiter of areaWaiters) waiter(data);
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The drawn rectangle, cut from the capture at device pixels.
async function cropPng(dataUrl: string, area: PageArea): Promise<Blob> {
  const bitmap = await createImageBitmap(await (await fetch(dataUrl)).blob());
  const sx = Math.max(0, Math.round(area.x * area.dpr));
  const sy = Math.max(0, Math.round(area.y * area.dpr));
  const width = Math.min(bitmap.width - sx, Math.round(area.width * area.dpr));
  const height = Math.min(
    bitmap.height - sy,
    Math.round(area.height * area.dpr),
  );
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Couldn't crop the screenshot.");
  context.drawImage(bitmap, sx, sy, width, height, 0, 0, width, height);
  bitmap.close();
  return canvas.convertToBlob({ type: "image/png" });
}

export function ScreenshotPanel() {
  const [state, setState] = useState<ShotState>({ kind: "idle" });
  const [type, setType] = useState<ScreenshotType>("area");
  const waiting = useRef<((area: PageArea | null) => void) | null>(null);

  useEffect(() => {
    void getCapturePrefs().then((p) => setType(p.shot ?? "area"));
    return watchCapturePrefs((p) => setType(p.shot ?? "area"));
  }, []);

  useEffect(
    () => () => {
      if (waiting.current) areaWaiters.delete(waiting.current);
    },
    [],
  );

  const chooseType = (next: ScreenshotType) => {
    setType(next);
    void getCapturePrefs().then((p) => setCapturePrefs({ ...p, shot: next }));
  };

  // The panel, dim, bubble and bar step out of the picture for the capture.
  const withChromeHidden = async <T,>(work: () => Promise<T>): Promise<T> => {
    await sendMessage("setOverlayVisible", { visible: false });
    try {
      await sleep(SETTLE_MS);
      return await work();
    } finally {
      void sendMessage("setOverlayVisible", { visible: true });
    }
  };

  const pickArea = (): Promise<PageArea | null> =>
    new Promise((resolve) => {
      const waiter = (area: PageArea | null) => {
        areaWaiters.delete(waiter);
        waiting.current = null;
        resolve(area);
      };
      areaWaiters.add(waiter);
      waiting.current = waiter;
      void sendMessage("selectArea", undefined);
    });

  const capture = async () => {
    setState({ kind: "busy" });
    try {
      const session = await getAuthSession();
      if (!session) throw new Error("Sign in to capture.");
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      let png: Blob;
      if (type === "area") {
        const area = await withChromeHidden(async () => {
          const picked = await pickArea();
          if (!picked) return null;
          await sleep(SETTLE_MS);
          const dataUrl = await chrome.tabs.captureVisibleTab({
            format: "png",
          });
          return cropPng(dataUrl, picked);
        });
        if (!area) {
          setState({ kind: "idle" });
          return;
        }
        png = area;
      } else {
        const dataUrl = isOverlaySurface
          ? await withChromeHidden(() =>
              chrome.tabs.captureVisibleTab({ format: "png" }),
            )
          : await chrome.tabs.captureVisibleTab({ format: "png" });
        png = await (await fetch(dataUrl)).blob();
      }

      const bitmap = await createImageBitmap(png);
      const deviceId = await getDeviceId();
      const res = await uploadScreenshot(deviceId, session.token, {
        png,
        width: bitmap.width,
        height: bitmap.height,
        title: tab?.title ?? undefined,
      });
      bitmap.close();
      // The share page is the result; it opens in its own tab.
      await chrome.tabs.create({ url: res.viewUrl });
      setState({ kind: "idle" });
    } catch (err) {
      if (isAuthFailure(err)) await setAuthSession(null);
      setState({ kind: "error", detail: screenshotError(err) });
    }
  };

  const isBusy = state.kind === "busy";

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Screenshot type</h2>

      <div
        role="radiogroup"
        aria-label="Screenshot type"
        className="flex gap-3"
      >
        {TYPES.map((option) => {
          const on = option.id === type;
          return (
            <div key={option.id} className="flex min-w-0 flex-1 flex-col gap-2">
              <button
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={option.label}
                onClick={() => chooseType(option.id)}
                className={`flex h-[84px] cursor-pointer items-center justify-center rounded-[22px] border outline-none transition-colors motion-reduce:transition-none ${
                  on
                    ? "border-accent bg-(--cf-selected) text-accent"
                    : "border-separator bg-surface text-foreground hover:bg-overlay"
                }`}
              >
                {option.icon}
              </button>
              <span className="text-center text-[15px]">{option.label}</span>
            </div>
          );
        })}
      </div>

      <Button
        variant="primary"
        fullWidth
        isDisabled={isBusy}
        onPress={() => void capture()}
        className="h-[50px] rounded-[14px] border border-separator text-[15px] font-semibold"
      >
        {isBusy && <Spinner size="sm" color="current" />}
        {isBusy
          ? "Capturing…"
          : type === "area"
            ? "Select area"
            : "Capture Screenshot"}
      </Button>

      {state.kind === "error" && (
        <Typography type="body-xs" className="text-danger">
          {state.detail}
        </Typography>
      )}
    </div>
  );
}
