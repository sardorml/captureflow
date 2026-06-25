import { create } from "zustand";
import type {
  CaptureSource,
  RecordingMode,
  RecordingAuthState,
} from "../../../shared/types";

export type RecordingStatus =
  | "idle"
  | "preparing"
  | "recording"
  | "paused"
  | "saving";

type MediaDeviceInfo = {
  deviceId: string;
  label: string;
};

type RecordingState = {
  status: RecordingStatus;
  sources: CaptureSource[];
  selectedSource: CaptureSource | null;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  selectedAudioDevice: string | null;
  selectedVideoDevice: string | null;
  systemAudioEnabled: boolean;
  recordingMode: RecordingMode;
  devicesReady: boolean;
  elapsedTime: number;
  error: string | null;
  // Local mirror of main's recording-auth; drives the lock icon on the recording-mode record button.
  recordingAuth: RecordingAuthState;

  setSources: (sources: CaptureSource[]) => void;
  setSelectedSource: (source: CaptureSource | null) => void;
  setAudioDevices: (devices: MediaDeviceInfo[]) => void;
  setVideoDevices: (devices: MediaDeviceInfo[]) => void;
  setSelectedAudioDevice: (deviceId: string | null) => void;
  setSelectedVideoDevice: (deviceId: string | null) => void;
  setSystemAudioEnabled: (enabled: boolean) => void;
  setRecordingMode: (mode: RecordingMode) => void;
  setStatus: (status: RecordingStatus) => void;
  setElapsedTime: (time: number) => void;
  setError: (error: string | null) => void;
  setRecordingAuth: (state: RecordingAuthState) => void;
  reset: () => void;
};

function loadPersistedBool(key: string, defaultValue: boolean): boolean {
  try {
    const v = localStorage.getItem(key);
    return v !== null ? v === "1" : defaultValue;
  } catch {
    return defaultValue;
  }
}

function loadPersistedMode(): RecordingMode {
  try {
    const v = localStorage.getItem("captureflow-mode");
    if (v === "recording") return "recording";
    if (v === "screenshot") return "screenshot";
    return "recording";
  } catch {
    return "recording";
  }
}

/*
 * Selected mic/camera deviceIds are intentionally NOT loaded here: the toolbar
 * restores them only after `getPermissions()` confirms TCC access, else a stale
 * selection flashes the bubble window open then closed. See RecordingToolbar.tsx.
 */
const initialState = {
  status: "idle" as RecordingStatus,
  sources: [] as CaptureSource[],
  selectedSource: null as CaptureSource | null,
  audioDevices: [] as MediaDeviceInfo[],
  videoDevices: [] as MediaDeviceInfo[],
  selectedAudioDevice: null as string | null,
  selectedVideoDevice: null as string | null,
  systemAudioEnabled: loadPersistedBool("captureflow-sysaudio", false),
  recordingMode: loadPersistedMode(),
  devicesReady: false,
  elapsedTime: 0,
  error: null as string | null,
  recordingAuth: { kind: "signed_out" } as RecordingAuthState,
};

export const useRecordingStore = create<RecordingState>((set, get) => ({
  ...initialState,

  setSources: (sources): void => set({ sources }),
  setSelectedSource: (source): void => set({ selectedSource: source }),
  setAudioDevices: (devices): void => set({ audioDevices: devices }),
  setVideoDevices: (devices): void =>
    set({ videoDevices: devices, devicesReady: true }),
  setSelectedAudioDevice: (deviceId): void => {
    try {
      if (deviceId) {
        localStorage.setItem("captureflow-mic", deviceId);
        const label = get().audioDevices.find(
          (d) => d.deviceId === deviceId,
        )?.label;
        if (label) localStorage.setItem("captureflow-mic-label", label);
      } else {
        localStorage.removeItem("captureflow-mic");
        localStorage.removeItem("captureflow-mic-label");
      }
    } catch {
      // ignore
    }
    set({ selectedAudioDevice: deviceId });
  },
  setSelectedVideoDevice: (deviceId): void => {
    try {
      if (deviceId) {
        localStorage.setItem("captureflow-cam", deviceId);
        const label = get().videoDevices.find(
          (d) => d.deviceId === deviceId,
        )?.label;
        if (label) localStorage.setItem("captureflow-cam-label", label);
      } else {
        localStorage.removeItem("captureflow-cam");
        localStorage.removeItem("captureflow-cam-label");
      }
    } catch {
      // ignore
    }
    set({ selectedVideoDevice: deviceId });
  },
  setSystemAudioEnabled: (enabled): void => {
    try {
      localStorage.setItem("captureflow-sysaudio", enabled ? "1" : "0");
    } catch {
      // ignore
    }
    set({ systemAudioEnabled: enabled });
  },
  setRecordingMode: (mode): void => {
    try {
      localStorage.setItem("captureflow-mode", mode);
    } catch {
      // ignore
    }
    set({ recordingMode: mode });
  },
  setStatus: (status): void => set({ status }),
  setElapsedTime: (time): void => set({ elapsedTime: time }),
  setError: (error): void => set({ error }),
  setRecordingAuth: (state): void => set({ recordingAuth: state }),
  reset: (): void =>
    set((state) => ({
      ...initialState,
      sources: state.sources,
      audioDevices: state.audioDevices,
      videoDevices: state.videoDevices,
      selectedSource: state.selectedSource,
      selectedAudioDevice: state.selectedAudioDevice,
      selectedVideoDevice: state.selectedVideoDevice,
      systemAudioEnabled: state.systemAudioEnabled,
      recordingMode: state.recordingMode,
      recordingAuth: state.recordingAuth,
    })),
}));
