import { useEffect, useState } from "react";
import { Alert, Button, Dropdown } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import { isOverlaySurface } from "@/lib/surface";
import {
  getCameraBlocked,
  getCapturePrefs,
  getRecordingStatus,
  setCapturePrefs,
  watchCameraBlocked,
  watchCapturePrefs,
  type CapturePrefs,
} from "@/lib/storage";
import { LIVE_KINDS } from "@/lib/capture/status";
import {
  useMediaDevices,
  type MediaDeviceOption,
} from "@/hooks/use-media-devices";
import { MicMeter } from "./MicMeter";
import {
  MENU_CHECK,
  MENU_ITEM,
  MENU_LIST,
  MENU_OFFSET,
  MENU_POPOVER,
  PANEL_ROW_GREY,
} from "./panel";

// Clear of the overlay's .16s open plus the frame it reveals on.
const PREVIEW_RESTORE_DELAY_MS = 220;

const CAMERA_SHAPE = (
  <>
    <rect
      x="3"
      y="6.5"
      width="12.5"
      height="11"
      rx="2.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="m16 10.5 4.2-2.4v7.8L16 13.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </>
);

const MIC_SHAPE = (
  <>
    <rect
      x="9"
      y="3.5"
      width="6"
      height="11"
      rx="3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </>
);

const SLASH = (
  <path
    d="m4 4 16 16"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  />
);

function deviceIcon(shape: React.ReactNode, off: boolean) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      {shape}
      {off && SLASH}
    </svg>
  );
}

async function isMicGranted(): Promise<boolean> {
  try {
    const perm = await navigator.permissions.query({
      name: "microphone" as PermissionName,
    });
    return perm.state === "granted";
  } catch {
    return false;
  }
}

type DeviceChoice = { on: boolean; deviceId?: string };

type DeviceRowProps = {
  shape: React.ReactNode;
  label: string;
  // What the row says while the device is off.
  offLabel: string;
  devices: MediaDeviceOption[];
  selectedId: string | undefined;
  on: boolean;
  onChange: (next: DeviceChoice) => void;
  // Rendered along the row's bottom edge rather than under it, so the level
  // reads as part of the mic row instead of a stray bar.
  meter?: React.ReactNode;
};

const OFF_KEY = "off";
const ON_KEY = "on";

/*
 * The row is one menu: off at the top, then each device, so switching and
 * picking are the same gesture. The icon reads the state back, crossed and
 * red while the device is off.
 */
function DeviceRow({
  shape,
  label,
  offLabel,
  devices,
  selectedId,
  on,
  onChange,
  meter,
}: DeviceRowProps) {
  // Device labels stay empty until the origin holds a grant; offer a plain
  // "on" then, rather than a menu of blank entries.
  const named = devices.filter((d) => d.label && d.deviceId);
  const current = named.find((d) => d.deviceId === selectedId) ?? named[0];
  const selectedKey = on ? (current?.deviceId ?? ON_KEY) : OFF_KEY;

  const choose = (key: string) => {
    if (key === OFF_KEY) onChange({ on: false });
    else if (key === ON_KEY) onChange({ on: true });
    else onChange({ on: true, deviceId: key });
  };

  return (
    <Dropdown>
      <Dropdown.Trigger
        aria-label={label}
        className={`${PANEL_ROW_GREY} relative w-full cursor-pointer overflow-hidden text-start outline-none`}
      >
        <span
          className={`flex shrink-0 ${on ? "text-foreground" : "text-(--cf-off)"}`}
          aria-hidden
        >
          {deviceIcon(shape, !on)}
        </span>
        <span className="min-w-0 flex-1 truncate">
          {on ? (current?.label ?? label) : offLabel}
        </span>
        {meter}
      </Dropdown.Trigger>
      <Dropdown.Popover
        placement={isOverlaySurface ? "left top" : "bottom start"}
        offset={isOverlaySurface ? MENU_OFFSET : undefined}
        shouldFlip={!isOverlaySurface}
        className={MENU_POPOVER}
      >
        <Dropdown.Menu
          selectionMode="single"
          selectedKeys={[selectedKey]}
          onAction={(key) => choose(String(key))}
          className={MENU_LIST}
        >
          <Dropdown.Item id={OFF_KEY} className={MENU_ITEM}>
            <span className="flex text-(--cf-off)" aria-hidden>
              {deviceIcon(shape, true)}
            </span>
            {offLabel}
            <Dropdown.ItemIndicator className={MENU_CHECK} />
          </Dropdown.Item>
          {named.length > 0 ? (
            named.map((device) => (
              <Dropdown.Item
                key={device.deviceId}
                id={device.deviceId}
                textValue={device.label}
                className={MENU_ITEM}
              >
                <span className="flex" aria-hidden>
                  {deviceIcon(shape, false)}
                </span>
                <span className="min-w-0 flex-1 truncate">{device.label}</span>
                <Dropdown.ItemIndicator className={MENU_CHECK} />
              </Dropdown.Item>
            ))
          ) : (
            <Dropdown.Item id={ON_KEY} className={MENU_ITEM}>
              <span className="flex" aria-hidden>
                {deviceIcon(shape, false)}
              </span>
              {label}
              <Dropdown.ItemIndicator className={MENU_CHECK} />
            </Dropdown.Item>
          )}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export function DevicePickers() {
  const [prefs, setPrefs] = useState<CapturePrefs>({
    camera: false,
    mic: false,
  });
  const [blocked, setBlocked] = useState(false);
  const devices = useMediaDevices();

  useEffect(() => {
    void getCapturePrefs().then(setPrefs);
    void getCameraBlocked().then(setBlocked);
    const unwatchPrefs = watchCapturePrefs(setPrefs);
    const unwatchBlocked = watchCameraBlocked(setBlocked);
    return () => {
      unwatchPrefs();
      unwatchBlocked();
    };
  }, []);

  /*
   * The preview is torn down with the panel, so a camera left switched on gets
   * it back on the next open. Not while recording: that stream already holds
   * the camera, and a second getUserMedia on it reports back as blocked.
   *
   * Held back until the panel has finished opening. Mounting the bubble puts an
   * out-of-process frame and a getUserMedia on the page's main thread, and the
   * open reads as a stutter if that lands mid-animation. Nothing waits on the
   * preview, so it can have the thread once the panel is up.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      void (async () => {
        const [saved, status] = await Promise.all([
          getCapturePrefs(),
          getRecordingStatus(),
        ]);
        if (!saved.camera || LIVE_KINDS.has(status.kind)) return;
        if (await getCameraBlocked()) return;
        void sendMessage("setCameraBubble", { on: true, mic: saved.mic });
      })();
    }, PREVIEW_RESTORE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  /*
   * Camera preview + grant run through the in-page bubble (getUserMedia can't
   * prompt from a popup). A camera-less mic needs its own grant, seeded by the
   * permissions tab.
   */
  const update = async (partial: Partial<CapturePrefs>) => {
    const next = { ...prefs, ...partial };
    setPrefs(next);
    await setCapturePrefs(next);
    if (
      partial.camera !== undefined ||
      (next.camera && partial.mic !== undefined)
    ) {
      void sendMessage("setCameraBubble", { on: next.camera, mic: next.mic });
    }
    if (partial.mic === true && !next.camera && !(await isMicGranted())) {
      await chrome.tabs.create({
        url: chrome.runtime.getURL("permissions.html?audio=1"),
      });
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <DeviceRow
        shape={CAMERA_SHAPE}
        label="Camera"
        offLabel={blocked ? "Camera blocked" : "No camera"}
        devices={devices.cameras}
        selectedId={prefs.cameraId}
        on={prefs.camera && !blocked}
        onChange={({ on, deviceId }) =>
          void update({
            camera: on,
            ...(deviceId ? { cameraId: deviceId } : {}),
          })
        }
      />
      {blocked && (
        <Alert status="warning">
          <Alert.Content>
            <Alert.Title>Camera blocked</Alert.Title>
            <Alert.Description>
              Allow the camera for this extension in your browser&rsquo;s camera
              settings, then try again.
            </Alert.Description>
            <Button
              variant="primary"
              size="sm"
              className="mt-2 self-start"
              onPress={() => void update({ camera: true })}
            >
              Try again
            </Button>
          </Alert.Content>
        </Alert>
      )}
      <DeviceRow
        shape={MIC_SHAPE}
        label="Microphone"
        offLabel="No microphone"
        devices={devices.mics}
        selectedId={prefs.micId}
        on={prefs.mic}
        onChange={({ on, deviceId }) =>
          void update({ mic: on, ...(deviceId ? { micId: deviceId } : {}) })
        }
        meter={<MicMeter enabled={prefs.mic} />}
      />
    </section>
  );
}
