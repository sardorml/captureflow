import { useEffect, useState } from "react";
import { Alert, Button, ListBox, Select, Typography } from "@heroui/react";
import { sendMessage } from "@/lib/messaging";
import {
  getCameraBlocked,
  getCapturePrefs,
  setCapturePrefs,
  watchCameraBlocked,
  watchCapturePrefs,
  type CapturePrefs,
} from "@/lib/storage";
import {
  useMediaDevices,
  type MediaDeviceOption,
} from "@/hooks/use-media-devices";
import { MicMeter } from "./MicMeter";

const CAMERA_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
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
  </svg>
);

const MIC_ICON = (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
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
  </svg>
);

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

type DeviceRowProps = {
  icon: React.ReactNode;
  label: string;
  devices: MediaDeviceOption[];
  selectedId: string | undefined;
  on: boolean;
  onToggle: (on: boolean) => void;
  onSelect: (deviceId: string) => void;
  // Rendered along the row's bottom edge rather than under it, so the level
  // reads as part of the mic row instead of a stray bar.
  meter?: React.ReactNode;
};

function DeviceRow({
  icon,
  label,
  devices,
  selectedId,
  on,
  onToggle,
  onSelect,
  meter,
}: DeviceRowProps) {
  // Device labels stay empty until the origin holds a grant; fall back to the
  // static row label rather than rendering a picker of blank entries.
  const named = devices.filter((d) => d.label && d.deviceId);

  return (
    <div
      className="relative flex items-center gap-2.5 overflow-hidden rounded-xl bg-surface px-3 py-2.5 data-[on=true]:outline data-[on=true]:outline-border"
      data-on={on}
    >
      <span className="flex text-foreground" aria-hidden>
        {icon}
      </span>
      {named.length > 0 ? (
        <Select
          aria-label={label}
          selectedKey={selectedId ?? named[0]?.deviceId}
          onSelectionChange={(key) => onSelect(String(key))}
          className="min-w-0 flex-1"
        >
          <Select.Trigger className="w-full justify-between border-0 bg-transparent px-0">
            <Select.Value className="truncate text-sm font-medium" />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {named.map((device) => (
                <ListBox.Item
                  key={device.deviceId}
                  id={device.deviceId}
                  textValue={device.label}
                >
                  {device.label}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ) : (
        <Typography type="body-sm" weight="medium" className="flex-1 truncate">
          {label}
        </Typography>
      )}
      {/* A labelled On/Off pill rather than a switch: at this row height the
          track read as decoration, and the state now says itself. */}
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => onToggle(!on)}
        className={[
          "shrink-0 cursor-pointer rounded-md border px-1.5 py-0.5 text-[11px] font-semibold transition-colors motion-reduce:transition-none",
          on
            ? "border-success text-success"
            : "border-separator text-muted hover:text-foreground",
        ].join(" ")}
      >
        {on ? "On" : "Off"}
      </button>
      {meter}
    </div>
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
    <section className="flex flex-col gap-2">
      <DeviceRow
        icon={CAMERA_ICON}
        label={blocked ? "Camera blocked" : "Camera"}
        devices={devices.cameras}
        selectedId={prefs.cameraId}
        on={prefs.camera && !blocked}
        onToggle={(on) => void update({ camera: on })}
        onSelect={(cameraId) => void update({ cameraId })}
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
        icon={MIC_ICON}
        label="Microphone"
        devices={devices.mics}
        selectedId={prefs.micId}
        on={prefs.mic}
        onToggle={(on) => void update({ mic: on })}
        onSelect={(micId) => void update({ micId })}
        meter={<MicMeter enabled={prefs.mic} />}
      />
    </section>
  );
}
