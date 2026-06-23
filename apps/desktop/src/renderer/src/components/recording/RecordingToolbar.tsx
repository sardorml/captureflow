import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useRecordingStore } from "@/stores/recording-store";
import { useSources } from "@/hooks/use-sources";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { useRecorder } from "@/hooks/use-recorder";
import {
  TOOLBAR_BAR_HEIGHT,
  TOOLBAR_HEIGHT,
  TOOLBAR_TOOLTIP_BELOW,
  type SelectionOverlayMode,
} from "../../../../shared/types";
import {
  AppWindow,
  Camera,
  CameraOff,
  ChevronDown,
  Mic,
  MicOff,
  Monitor,
  Scan,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { RecordingModeToggle } from "./RecordingModeToggle";
import { ToolbarStatusNudge } from "./ToolbarStatusNudge";
import AnimatedTooltip from "@/components/ui/animated-tooltip";

const SOURCES: {
  mode: SelectionOverlayMode;
  icon: LucideIcon;
  label: string;
  tooltip: string;
}[] = [
  {
    mode: "display",
    icon: Monitor,
    label: "Display",
    tooltip: "Record an entire display",
  },
  {
    mode: "window",
    icon: AppWindow,
    label: "Window",
    tooltip: "Record a single window",
  },
  {
    mode: "area",
    icon: Scan,
    label: "Area",
    tooltip: "Record a custom region",
  },
];

// Sits in the drag region so the gaps between clusters stay grabbable.
function Divider(): React.JSX.Element {
  return (
    <div
      className="flex items-center self-stretch px-1.5"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      aria-hidden
    >
      <div className="w-px self-stretch my-2 bg-white/15" />
    </div>
  );
}

function GripDots({ className }: { className?: string }): React.JSX.Element {
  return (
    <div
      className={`grid grid-cols-2 gap-[3px] self-center cursor-grab active:cursor-grabbing ${
        className ?? ""
      }`}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      aria-label="Drag toolbar"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[3px] h-[3px] rounded-full bg-white/40" />
      ))}
    </div>
  );
}

function HoverItem({
  children,
  className,
  active,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  const getOrigin = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return "50% 50%";
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return `${x}% ${y}%`;
  }, []);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (active || !bgRef.current) return;
      const bg = bgRef.current;
      bg.style.transformOrigin = getOrigin(e);
      bg.style.transition = "none";
      bg.style.transform = "scale(0.3)";
      bg.style.opacity = "0";
      void bg.offsetHeight;
      bg.style.transition = "transform 150ms ease-out, opacity 80ms ease-out";
      bg.style.transform = "scale(1)";
      bg.style.opacity = "1";
    },
    [active, getOrigin],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent) => {
      if (active || !bgRef.current) return;
      const bg = bgRef.current;
      bg.style.transformOrigin = getOrigin(e);
      bg.style.transition =
        "transform 100ms cubic-bezier(0.5, 0, 0.75, 0), opacity 100ms ease-in";
      bg.style.transform = "scale(0.3)";
      bg.style.opacity = "0";
    },
    [active, getOrigin],
  );

  return (
    <div
      ref={ref}
      className={`relative rounded-md overflow-hidden flex items-center ${className ?? ""}`}
      style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-foreground/8 rounded-md pointer-events-none"
        style={{
          transform: active ? "scale(1)" : "scale(0)",
          transition: "transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      />
      {children}
    </div>
  );
}

type DeviceOption = { value: string; label: string };

function DeviceCell({
  icon: Icon,
  offIcon: OffIcon,
  iconLabel,
  selectValue,
  isActive,
  options,
  onChange,
  tooltip,
}: {
  icon: LucideIcon;
  offIcon: LucideIcon;
  iconLabel: string;
  selectValue: string;
  isActive: boolean;
  options: DeviceOption[];
  onChange: (value: string) => void;
  tooltip: string;
}): React.JSX.Element {
  const Glyph = isActive ? Icon : OffIcon;
  return (
    <AnimatedTooltip content={tooltip} placement="bottom">
      <div
        className="relative flex h-8 items-center gap-0.5 rounded-lg px-1.5 cursor-pointer transition-colors hover:bg-white/5"
        aria-label={iconLabel}
      >
        <Glyph
          className={`w-[18px] h-[18px] ${isActive ? "text-white" : "text-red-400"}`}
          strokeWidth={2}
        />
        <ChevronDown
          className={`w-3 h-3 shrink-0 ${isActive ? "text-white/55" : "text-white/35"}`}
          strokeWidth={2}
        />
        <select
          value={selectValue}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer text-[14px]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </AnimatedTooltip>
  );
}

/**
 * Drive macOS TCC for camera/mic via the main process. We deliberately do
 * NOT use `getUserMedia` as a probe here: Chromium's media stack succeeds
 * silently after `setPermissionRequestHandler` grants the Chromium-level
 * permission, so the OS TCC prompt never fires and CaptureFlow never registers
 * in System Settings. `systemPreferences.askForMediaAccess` is the only
 * call that drives the native prompt and the registration.
 */
async function ensureMediaPermission(
  kind: "camera" | "microphone",
): Promise<boolean> {
  return window.electronAPI.requestMediaPermission(kind);
}

function IdleToolbar(): React.JSX.Element {
  const audioDevices = useRecordingStore((s) => s.audioDevices);
  const videoDevices = useRecordingStore((s) => s.videoDevices);
  const selectedAudioDevice = useRecordingStore((s) => s.selectedAudioDevice);
  const selectedVideoDevice = useRecordingStore((s) => s.selectedVideoDevice);
  const setSelectedAudioDevice = useRecordingStore(
    (s) => s.setSelectedAudioDevice,
  );
  const setSelectedVideoDevice = useRecordingStore(
    (s) => s.setSelectedVideoDevice,
  );
  const systemAudioEnabled = useRecordingStore((s) => s.systemAudioEnabled);
  const setSystemAudioEnabled = useRecordingStore(
    (s) => s.setSystemAudioEnabled,
  );
  const recordingMode = useRecordingStore((s) => s.recordingMode);
  const showDeviceCells = recordingMode !== "screenshot";

  const handleCameraChange = async (value: string): Promise<void> => {
    if (value === "none") {
      setSelectedVideoDevice(null);
      return;
    }
    if (await ensureMediaPermission("camera")) {
      setSelectedVideoDevice(value);
    }
  };

  const handleMicChange = async (value: string): Promise<void> => {
    if (value === "none") {
      setSelectedAudioDevice(null);
      return;
    }
    if (await ensureMediaPermission("microphone")) {
      setSelectedAudioDevice(value);
    }
  };

  const [overlayMode, setOverlayMode] = useState<SelectionOverlayMode | null>(
    null,
  );

  const toggleOverlay = (mode: SelectionOverlayMode): void => {
    if (overlayMode === mode) {
      setOverlayMode(null);
      window.electronAPI.closeSelectionOverlay();
    } else {
      setOverlayMode(mode);
      // Dev-only: forward the "Record self" toggle so the picker's hover
      // detector includes CaptureFlow's own windows — otherwise the editor is
      // invisible to the window picker and can't be selected.
      const includeSelf =
        import.meta.env.DEV &&
        localStorage.getItem("captureflow.dev.recordSelf") === "1";
      window.electronAPI.openSelectionOverlay(
        mode,
        {
          hasCamera: !!selectedVideoDevice,
          hasMic: !!selectedAudioDevice,
        },
        includeSelf,
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && overlayMode) {
        setOverlayMode(null);
        window.electronAPI.closeSelectionOverlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [overlayMode]);

  // Main cancels the overlay when the user swipes to a different macOS Space.
  // Reset the mode button so the next click reopens cleanly.
  useEffect(() => {
    return window.electronAPI.onSelectionOverlayCancelled(() => {
      setOverlayMode(null);
    });
  }, []);

  const persistedCamLabel = (() => {
    try {
      return localStorage.getItem("captureflow-cam-label");
    } catch {
      return null;
    }
  })();
  const persistedMicLabel = (() => {
    try {
      return localStorage.getItem("captureflow-mic-label");
    } catch {
      return null;
    }
  })();

  const cameraOptions: DeviceOption[] =
    videoDevices.length > 0
      ? [
          { value: "none", label: "No camera" },
          ...videoDevices.map((d) => ({ value: d.deviceId, label: d.label })),
        ]
      : [
          { value: "none", label: "No camera" },
          ...(selectedVideoDevice && persistedCamLabel
            ? [{ value: selectedVideoDevice, label: persistedCamLabel }]
            : []),
        ];

  const micOptions: DeviceOption[] =
    audioDevices.length > 0
      ? [
          { value: "none", label: "No microphone" },
          ...audioDevices.map((d) => ({ value: d.deviceId, label: d.label })),
        ]
      : [
          { value: "none", label: "No microphone" },
          ...(selectedAudioDevice && persistedMicLabel
            ? [{ value: selectedAudioDevice, label: persistedMicLabel }]
            : []),
        ];

  return (
    <>
      <RecordingModeToggle />

      <Divider />

      <div
        className="flex items-center gap-1 rounded-[10px] bg-black/20 p-1"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        {SOURCES.map(({ mode, icon: Icon, label, tooltip }) => {
          const active = overlayMode === mode;
          return (
            <AnimatedTooltip key={mode} content={tooltip} placement="bottom">
              <button
                onClick={() => toggleOverlay(mode)}
                aria-label={label}
                aria-pressed={active}
                className={`flex h-8 w-9 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-white/45 hover:text-white/85 hover:bg-white/5"
                }`}
              >
                <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
              </button>
            </AnimatedTooltip>
          );
        })}
      </div>

      <Divider />

      {/* Device cells stay `invisible` (not removed) so they reserve width and the bar never resizes between modes. */}
      <div className="relative flex items-center">
        <div
          data-testid="recording-device-cells"
          className={`flex items-center gap-1 ${showDeviceCells ? "" : "invisible"}`}
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <DeviceCell
            icon={Camera}
            offIcon={CameraOff}
            iconLabel="Camera"
            selectValue={selectedVideoDevice ?? "none"}
            isActive={!!selectedVideoDevice}
            options={cameraOptions}
            onChange={handleCameraChange}
            tooltip="Pick a camera to overlay (or turn it off)"
          />
          <DeviceCell
            icon={Mic}
            offIcon={MicOff}
            iconLabel="Microphone"
            selectValue={selectedAudioDevice ?? "none"}
            isActive={!!selectedAudioDevice}
            options={micOptions}
            onChange={handleMicChange}
            tooltip="Pick a microphone to record (or turn it off)"
          />
          <DeviceCell
            icon={Volume2}
            offIcon={VolumeX}
            iconLabel="System audio"
            selectValue={systemAudioEnabled ? "on" : "off"}
            isActive={systemAudioEnabled}
            options={[
              { value: "on", label: "On" },
              { value: "off", label: "Off" },
            ]}
            onChange={(v) => setSystemAudioEnabled(v === "on")}
            tooltip="Include audio from your Mac (app sounds, video playback)"
          />
        </div>
        {!showDeviceCells && (
          <span className="absolute inset-0 flex items-center justify-center select-none">
            <span className="truncate px-1.5 text-[13px] font-normal text-white/45">
              Screenshot
            </span>
          </span>
        )}
      </div>
    </>
  );
}

export function RecordingToolbar(): React.JSX.Element {
  const status = useRecordingStore((s) => s.status);
  const setSelectedSource = useRecordingStore((s) => s.setSelectedSource);
  const selectedVideoDevice = useRecordingStore((s) => s.selectedVideoDevice);
  const setSelectedVideoDevice = useRecordingStore(
    (s) => s.setSelectedVideoDevice,
  );
  const setSelectedAudioDevice = useRecordingStore(
    (s) => s.setSelectedAudioDevice,
  );
  const { startRecording } = useRecorder();

  useEffect(() => {
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }, []);

  const recordingMode = useRecordingStore((s) => s.recordingMode);

  useEffect(() => {
    void window.electronAPI.getShareAuth().then((state) => {
      useRecordingStore.getState().setShareAuth(state);
    });
    return window.electronAPI.onShareAuthChanged((state) => {
      useRecordingStore.getState().setShareAuth(state);
    });
  }, []);

  // Only restore the persisted mic/camera if the OS has granted TCC; a stale
  // deviceId without access flashes the webcam bubble. getPermissions is a
  // status read, not a TCC request, so it's safe at startup.
  useEffect(() => {
    void window.electronAPI.getPermissions().then((perms) => {
      if (perms.camera === "granted") {
        try {
          const persisted = localStorage.getItem("captureflow-cam");
          if (persisted) setSelectedVideoDevice(persisted);
        } catch {
          // localStorage unavailable — safe to ignore
        }
      }
      if (perms.microphone === "granted") {
        try {
          const persisted = localStorage.getItem("captureflow-mic");
          if (persisted) setSelectedAudioDevice(persisted);
        } catch {
          // localStorage unavailable — safe to ignore
        }
      }
    });
  }, [setSelectedVideoDevice, setSelectedAudioDevice]);

  useSources();
  useMediaDevices();

  // If a renderer reload drops state while the Swift recorder is still running,
  // the toolbar returns as `idle` mid-recording — hide it so the user can't
  // start a second recording. The stop overlay remains the source of truth.
  useEffect(() => {
    void window.electronAPI.isNativeRecordingActive().then((active) => {
      if (active) {
        window.electronAPI.hideWindow().catch(() => {});
      }
    });
  }, []);

  useEffect(() => {
    return window.electronAPI.onSourceSelected((source) => {
      setSelectedSource(source);
    });
  }, [setSelectedSource]);

  useEffect(() => {
    return window.electronAPI.onAutoStartRecording(() => {
      window.electronAPI.hideWindow().catch(() => {});
      void startRecording();
    });
  }, [startRecording]);

  // Screenshot mode soft-hides the bubble (keeps the MediaStream warm) because
  // re-acquiring the camera is a ~1s getUserMedia round-trip that reads as lag.
  // The ref guard short-circuits no-op transitions so the IPC fires only when
  // the visible/device state actually changes.
  const lastBubbleStateRef = useRef<{
    visible: boolean;
    device: string | null;
  }>({
    visible: false,
    device: null,
  });
  useEffect(() => {
    const hasDevice = !!selectedVideoDevice;
    const wantVisible = recordingMode !== "screenshot" && hasDevice;
    const wantDevice = hasDevice ? selectedVideoDevice : null;
    const last = lastBubbleStateRef.current;
    if (last.visible === wantVisible && last.device === wantDevice) return;
    const prev = last;
    lastBubbleStateRef.current = { visible: wantVisible, device: wantDevice };
    if (wantVisible && selectedVideoDevice) {
      window.electronAPI.showWebcamBubble(selectedVideoDevice).catch(() => {});
      return;
    }
    if (!hasDevice) {
      // Fully release the stream so the camera LED turns off.
      window.electronAPI.hideWebcamBubble().catch(() => {});
      return;
    }
    if (prev.device === wantDevice && wantDevice !== null) {
      window.electronAPI.softHideWebcamBubble().catch(() => {});
    } else {
      window.electronAPI.hideWebcamBubble().catch(() => {});
    }
  }, [recordingMode, selectedVideoDevice]);

  useEffect(() => {
    return window.electronAPI.onToolbarVisible(() => {
      const store = useRecordingStore.getState();
      // Force back to idle: a dirty exit can leave the store stuck non-idle,
      // and IdleToolbar is gated on `status === 'idle'`. Safe because the
      // window is hidden during real recording, so this only fires at the
      // start screen.
      if (store.status !== "idle") {
        store.setStatus("idle");
      }
      if (store.selectedVideoDevice && store.recordingMode !== "screenshot") {
        window.electronAPI
          .showWebcamBubble(store.selectedVideoDevice)
          .catch(() => {});
      }
    });
  }, []);

  // Click-through: the window is taller than the visible bar, so clicks in the
  // empty area should pass to the app underneath. Publish the union of
  // `[data-toolbar-hit]` rects (window-local coords) to main, which polls the
  // cursor and toggles `setIgnoreMouseEvents` — avoiding the focus/activate race
  // when the cursor is already inside the hit region before any move event.
  useEffect(() => {
    const HIT_SLOP = 3;

    const publish = (): void => {
      const els = document.querySelectorAll<HTMLElement>("[data-toolbar-hit]");
      const rects: { x: number; y: number; width: number; height: number }[] =
        [];
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        rects.push({
          x: Math.round(r.left - HIT_SLOP),
          y: Math.round(r.top - HIT_SLOP),
          width: Math.round(r.width + HIT_SLOP * 2),
          height: Math.round(r.height + HIT_SLOP * 2),
        });
      }
      window.electronAPI.toolbarSetHitRects(rects);
    };

    publish();
    let raf = 0;
    const schedule = (): void => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        publish();
      });
    };
    const ro = new ResizeObserver(schedule);
    const mo = new MutationObserver(schedule);
    document
      .querySelectorAll<HTMLElement>("[data-toolbar-hit]")
      .forEach((el) => ro.observe(el));
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
    // Keep rects in sync during motion animations: the rendered size doesn't
    // change per frame but the BCR can shift.
    const tick = setInterval(publish, 100);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mo.disconnect();
      clearInterval(tick);
      // Clear rects so an unmounted toolbar doesn't keep eating clicks.
      window.electronAPI.toolbarSetHitRects([]);
    };
  }, []);

  return (
    <div
      className="relative flex flex-col"
      style={{ background: "transparent", height: TOOLBAR_HEIGHT }}
    >
      <div
        className="mt-auto flex justify-center"
        style={{ marginBottom: TOOLBAR_TOOLTIP_BELOW }}
      >
        <div className="flex flex-col items-start gap-1.5">
          <ToolbarStatusNudge visible={status === "idle"} />
          <motion.div
            layout
            data-toolbar-hit
            className="relative flex items-center gap-1.5 p-2 bg-neutral-700 rounded-2xl ring-1 ring-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={
              {
                WebkitAppRegion: "drag",
                margin: 0,
                height: TOOLBAR_BAR_HEIGHT,
              } as React.CSSProperties
            }
          >
            <AnimatedTooltip content="Close the toolbar" placement="bottom">
              <HoverItem className="self-center ml-0.5">
                <button
                  onClick={() => window.close()}
                  className="p-1 flex items-center justify-center"
                >
                  <X className="w-[18px] h-[18px] text-white" strokeWidth={2} />
                </button>
              </HoverItem>
            </AnimatedTooltip>

            {status === "idle" && <IdleToolbar />}

            <Divider />
            <div
              className="flex items-center pr-2.5"
              style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
            >
              <GripDots />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
