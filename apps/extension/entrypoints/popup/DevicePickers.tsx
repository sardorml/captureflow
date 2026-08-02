import { useEffect, useState } from "react";
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
  fallbackLabel: string;
  devices: MediaDeviceOption[];
  selectedId: string | undefined;
  on: boolean;
  onToggle: () => void;
  onSelect: (deviceId: string) => void;
};

function DeviceRow({
  icon,
  fallbackLabel,
  devices,
  selectedId,
  on,
  onToggle,
  onSelect,
}: DeviceRowProps) {
  const hasLabels = devices.some((d) => d.label && d.deviceId);
  return (
    <div className={on ? "cf-row is-on" : "cf-row"}>
      <span className="cf-row-icon" aria-hidden>
        {icon}
      </span>
      {hasLabels ? (
        <select
          className="cf-row-select"
          value={selectedId ?? devices[0]?.deviceId ?? ""}
          onChange={(event) => onSelect(event.target.value)}
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      ) : (
        <span className="cf-row-label">{fallbackLabel}</span>
      )}
      <button
        type="button"
        className={on ? "cf-pill is-on" : "cf-pill"}
        onClick={onToggle}
      >
        {on ? "On" : "Off"}
      </button>
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
    <section className="cf-section cf-pickers">
      <DeviceRow
        icon={CAMERA_ICON}
        fallbackLabel={blocked ? "Camera blocked" : "Camera"}
        devices={devices.cameras}
        selectedId={prefs.cameraId}
        on={prefs.camera && !blocked}
        onToggle={() => void update({ camera: !prefs.camera })}
        onSelect={(cameraId) => void update({ cameraId })}
      />
      {blocked && (
        <div className="cf-notice">
          <p className="cf-notice-title">Camera blocked</p>
          <p className="cf-hint">
            Allow the camera for this extension in your browser&rsquo;s camera
            settings, then try again.
          </p>
          <button
            type="button"
            className="cf-try"
            onClick={() => void update({ camera: true })}
          >
            Try again
          </button>
        </div>
      )}
      <DeviceRow
        icon={MIC_ICON}
        fallbackLabel="Microphone"
        devices={devices.mics}
        selectedId={prefs.micId}
        on={prefs.mic}
        onToggle={() => void update({ mic: !prefs.mic })}
        onSelect={(micId) => void update({ micId })}
      />
      <MicMeter enabled={prefs.mic} />
      {prefs.camera && !blocked && (
        <p className="cf-hint">
          Your camera bubble appears on normal web pages — not on internal
          browser pages like this one.
        </p>
      )}
    </section>
  );
}
