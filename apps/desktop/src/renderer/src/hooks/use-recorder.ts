import { useRef, useCallback, useEffect } from "react";
import { useRecordingStore } from "../stores/recording-store";
import {
  acquireMicCapture,
  acquireWebcamCapture,
} from "../lib/recording/webcam-capture";
import {
  recordingPipeline,
  RECORDING_CAP_MS,
} from "../lib/recording/recording-pipeline";
import { RecordingWebcamUploader } from "../lib/recording/recording-webcam-uploader";
import { track } from "../lib/analytics";
import {
  getWindowId,
  isWindowSource,
  type CaptureSource,
  type WindowBounds,
} from "../../../shared/types";

function formatRecordingTitle(source: CaptureSource | null): string | null {
  if (!source) return null;
  if (isWindowSource(source)) {
    return source.ownerName?.trim() || source.name?.trim() || null;
  }
  return source.name?.trim() || null;
}

export function useRecorder(): {
  startRecording: () => void;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
} {
  const store = useRecordingStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const recordingWebcamUploaderRef = useRef<RecordingWebcamUploader | null>(
    null,
  );
  const recordingEditUrlRef = useRef<string | null>(null);
  type RecordingPrep = {
    recordingStartPromise: Promise<
      import("../../../shared/types").RecordingStartResult
    >;
  };
  const recordingPrepRef = useRef<RecordingPrep | null>(null);
  const prepCapturePromiseRef = useRef<Promise<void> | null>(null);
  /*
   * Dedup guard distinct from prepCapturePromiseRef (which the cancel handler
   * nulls): survives a cancel so a record-right-after-cancel can't fire a
   * second getUserMedia in parallel and strand the camera/mic device.
   */
  const prepareInFlightRef = useRef<Promise<void> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
    webcamStreamRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    if (recordingWebcamUploaderRef.current) {
      recordingWebcamUploaderRef.current.abort();
      recordingWebcamUploaderRef.current = null;
    }
  }, []);

  const handleNativeRecordingStopped = useCallback(
    async (
      _screenPath: string,
      _systemAudioPath: string | null,
      _nativeDuration?: number,
      _nativeWidth?: number,
      _nativeHeight?: number,
    ): Promise<void> => {
      store.setStatus("saving");

      await window.electronAPI.hideRecordingOverlay();
      window.electronAPI.hideRecordingDim().catch(() => {});
      window.electronAPI.hideWebcamBubble().catch(() => {});
      window.electronAPI.restoreRecordingDisplayMode().catch(() => {});

      const recordingWebcamUploader = recordingWebcamUploaderRef.current;
      recordingWebcamUploaderRef.current = null;

      let webcamTotalBytes = 0;
      if (recordingWebcamUploader) {
        try {
          const res = await recordingWebcamUploader.stop();
          webcamTotalBytes = res.totalBytes;
        } catch (err) {
          window.electronAPI.log(
            "warn",
            "recording",
            `recording-webcam stop failed: ${String(err)}`,
          );
        }
      }
      cleanup();

      const recordingResult = await recordingPipeline.finish();
      const recordingState = recordingPipeline.getState();

      if (recordingResult) {
        window.electronAPI.log(
          "info",
          "recording",
          `finalized: ${recordingResult.sizeBytes}B, ${recordingResult.encodedFrames}fr, ${recordingResult.durationMs}ms`,
        );
        const editUrl = recordingEditUrlRef.current;
        if (editUrl) window.electronAPI.recordingReadyOpenLink(editUrl);
        if (recordingResult.posterBlob) {
          void recordingResult.posterBlob
            .arrayBuffer()
            .then((buf) => window.electronAPI.recordingUploadPoster(buf))
            .catch((err) =>
              window.electronAPI.log(
                "warn",
                "recording",
                `poster upload failed: ${String(err)}`,
              ),
            );
        }
        void window.electronAPI
          .recordingFinish({
            durationMs: recordingResult.durationMs,
            screenTotalBytes: recordingResult.sizeBytes,
            webcamTotalBytes,
          })
          .then((finishRes) => {
            if (!finishRes.ok) {
              window.electronAPI.log(
                "warn",
                "recording",
                `recordingFinish failed: ${finishRes.error}` +
                  (finishRes.partialUrl
                    ? ` (partial: ${finishRes.partialUrl})`
                    : ""),
              );
              void window.electronAPI.recordingFailureOpen(
                finishRes.partialUrl
                  ? {
                      kind: "partial",
                      message: finishRes.error,
                      url: finishRes.partialUrl,
                    }
                  : { kind: "no-link", message: finishRes.error },
              );
            }
          });
      } else if (recordingState.status === "over-cap") {
        window.electronAPI.log(
          "info",
          "recording",
          "over-cap; aborting upload",
        );
        window.electronAPI.recordingAbort();
      } else {
        const reason =
          recordingState.status === "aborted" && recordingState.reason
            ? recordingState.reason
            : "Recording could not be encoded.";
        window.electronAPI.log(
          "info",
          "recording",
          `no encoder result; state=${recordingState.status} reason=${reason}`,
        );
        window.electronAPI.recordingAbort();
        await window.electronAPI.recordingFailureOpen({
          kind: "init-failed",
          message: reason,
        });
      }
      store.setStatus("idle");
    },
    [store, cleanup],
  );

  const prepareCapture = useCallback(async () => {
    const { selectedAudioDevice, selectedVideoDevice } =
      useRecordingStore.getState();

    if (selectedVideoDevice) {
      const webcamCapture = await acquireWebcamCapture(selectedVideoDevice);
      if (webcamCapture) {
        webcamStreamRef.current = webcamCapture.stream;
      }
    }

    if (selectedAudioDevice) {
      const micCapture = await acquireMicCapture(selectedAudioDevice);
      if (micCapture) {
        micStreamRef.current = micCapture.stream;
      }
    }
  }, []);

  const ensurePrepare = useCallback((): Promise<void> => {
    if (prepareInFlightRef.current) return prepareInFlightRef.current;
    const p = prepareCapture().finally(() => {
      if (prepareInFlightRef.current === p) prepareInFlightRef.current = null;
    });
    prepareInFlightRef.current = p;
    return p;
  }, [prepareCapture]);

  const beginCapture = useCallback(async () => {
    const { selectedSource, systemAudioEnabled, recordingMode } =
      useRecordingStore.getState();
    const source = selectedSource;
    if (!source) return;
    const isRecording = recordingMode === "recording";

    try {
      window.electronAPI.showRecordingOverlay();
      await window.electronAPI.hideWindow();

      const focusPid = isWindowSource(source) ? source.pid : undefined;
      window.electronAPI.focusAppByPid(focusPid).catch(() => {});

      if (source.hideDesktopIcons) {
        await window.electronAPI
          .applyRecordingDisplayMode({ hideDesktopIcons: true })
          .catch(() => {});
      }

      const displayId = source.displayId
        ? parseInt(source.displayId, 10)
        : undefined;
      const windowId = getWindowId(source);
      const includeSelfWindows =
        import.meta.env.DEV &&
        localStorage.getItem("captureflow.dev.recordSelf") === "1";
      const cropRect: WindowBounds | undefined =
        windowId === undefined ? source.windowBounds : undefined;

      if (isRecording) {
        // Recording prep was kicked off at countdown start; if the prep ref is
        // missing (cancel race or non-overlay entry path) run the inline
        // fallback so we never lose the slug.
        const prep = recordingPrepRef.current;
        recordingPrepRef.current = null;
        const title = formatRecordingTitle(source);
        const hasWebcam = webcamStreamRef.current !== null;
        const startRes = await (prep?.recordingStartPromise ??
          window.electronAPI.recordingStart({ title, hasWebcam }));
        if (!startRes.ok) {
          window.electronAPI.log(
            "warn",
            "recording",
            `recordingStart failed: ${startRes.error}`,
          );
          throw new Error(startRes.error);
        }
        recordingEditUrlRef.current = startRes.editUrl;

        // audioExpected holds encoder init until the first audio-format event
        // arrives — required because mp4-muxer locks its track set at
        // construction time.
        recordingPipeline.arm({ audioExpected: systemAudioEnabled });
      }

      const result = await window.electronAPI.startNativeRecording({
        displayId,
        windowId,
        fps: 120,
        captureAudio: systemAudioEnabled,
        includeSelfWindows,
        cropRect,
      });
      const windowBounds: WindowBounds | undefined =
        result?.windowBounds ?? source.windowBounds;
      const wallClockMs: number | undefined = result?.wallClockMs;

      // Start the uploader only after native confirms its session started, so
      // MediaRecorder's wall-clock start aligns with the screen MP4's;
      // starting earlier surfaces as mic lag at playback time 0.
      if (recordingMode && webcamStreamRef.current) {
        const uploader = new RecordingWebcamUploader();
        uploader.start({
          webcamStream: webcamStreamRef.current,
          micStream: micStreamRef.current,
        });
        recordingWebcamUploaderRef.current = uploader;
      }

      store.setStatus("recording");
      store.setElapsedTime(0);
      window.electronAPI.showRecordingOverlay({
        startedAt: wallClockMs ?? Date.now(),
        capMs: recordingMode ? RECORDING_CAP_MS : undefined,
      });
      const dimBounds = windowBounds ?? source.windowBounds;
      const dimRadius = result?.cornerRadius ?? source.cornerRadius;
      if (dimBounds) {
        window.electronAPI
          .showRecordingDim(dimBounds, dimRadius)
          .catch(() => {});
      }
      window.electronAPI.playSound("Blow").catch(() => {});

      timerRef.current = setInterval(() => {
        const state = useRecordingStore.getState();
        if (state.status === "recording") {
          store.setElapsedTime(state.elapsedTime + 1);
        }
      }, 1000);
    } catch (error) {
      console.error("Failed to start recording:", error);
      recordingPipeline.abort("start-failed");
      window.electronAPI.recordingAbort();
      cleanup();
      await window.electronAPI.hideRecordingOverlay();
      window.electronAPI.hideRecordingDim().catch(() => {});
      window.electronAPI.restoreRecordingDisplayMode().catch(() => {});
      await window.electronAPI.showWindow();
      store.setError(
        error instanceof Error ? error.message : "Failed to start recording",
      );
      store.setStatus("idle");
    }
  }, [store, cleanup]);

  const startRecording = useCallback(async () => {
    const { selectedSource, selectedVideoDevice, selectedAudioDevice } =
      useRecordingStore.getState();

    let source = selectedSource;
    if (!source) {
      const { sources } = useRecordingStore.getState();
      const screenSource = sources.find(
        (s) => s.displayId !== "" || /screen|entire|display/i.test(s.name),
      );
      source = screenSource ?? sources[0] ?? null;
      if (source) {
        useRecordingStore.getState().setSelectedSource(source);
      }
    }
    if (!source) return;

    const perms = await window.electronAPI.getPermissions();
    if (selectedVideoDevice && perms.camera !== "granted") {
      const granted = await window.electronAPI.requestMediaPermission("camera");
      if (!granted) return;
    }
    if (selectedAudioDevice && perms.microphone !== "granted") {
      const granted =
        await window.electronAPI.requestMediaPermission("microphone");
      if (!granted) return;
    }

    store.setStatus("preparing");

    try {
      const pending = prepCapturePromiseRef.current;
      prepCapturePromiseRef.current = null;
      await (pending ?? ensurePrepare());
      await beginCapture();
      const recState = useRecordingStore.getState();
      track("recording_started", {
        mode: recState.recordingMode,
        has_webcam: recState.selectedVideoDevice !== null,
        has_mic: recState.selectedAudioDevice !== null,
      });
    } catch (error) {
      console.error("Failed to start recording:", error);
      cleanup();
      store.setError(
        error instanceof Error ? error.message : "Failed to start recording",
      );
      store.setStatus("idle");
    }
  }, [store, ensurePrepare, beginCapture, cleanup]);

  const stopRecording = useCallback(() => {
    window.electronAPI.playSound("Bottle").catch(() => {});
    window.electronAPI
      .stopNativeRecording()
      .then((result) => {
        track("recording_completed", {
          mode: useRecordingStore.getState().recordingMode,
          duration_sec: Math.round(result.duration),
        });
        handleNativeRecordingStopped(
          result.path,
          result.systemAudioPath ?? null,
          result.duration,
          result.width,
          result.height,
        );
      })
      .catch(() => {});
  }, [handleNativeRecordingStopped]);

  const pauseRecording = useCallback(() => {
    window.electronAPI.pauseNativeRecording();
    recordingPipeline.pause();
    store.setStatus("paused");
  }, [store]);

  const resumeRecording = useCallback(() => {
    window.electronAPI.resumeNativeRecording();
    recordingPipeline.resume();
    store.setStatus("recording");
  }, [store]);

  const stopAndCleanup = useCallback(() => {
    if (useRecordingStore.getState().status === "paused") {
      window.electronAPI.resumeNativeRecording();
    }

    recordingPipeline.abort("cancelled");
    window.electronAPI.recordingAbort();
    window.electronAPI
      .stopNativeRecording()
      .catch(() => {})
      .finally(() => {
        cleanup();
      });

    window.electronAPI.hideRecordingOverlay().catch(() => {});
    window.electronAPI.hideWebcamBubble().catch(() => {});
    window.electronAPI.hideRecordingDim().catch(() => {});
    window.electronAPI.restoreRecordingDisplayMode().catch(() => {});
    window.electronAPI.showWindow().catch(() => {});
    useRecordingStore.getState().setStatus("idle");

    const device = useRecordingStore.getState().selectedVideoDevice;
    if (device) {
      window.electronAPI.showWebcamBubble(device).catch(() => {});
    }
  }, [cleanup]);

  const restartRecording = useCallback(() => {
    stopAndCleanup();
    setTimeout(() => startRecording(), 300);
  }, [stopAndCleanup, startRecording]);

  useEffect(() => {
    recordingPipeline.attach();
  }, []);

  useEffect(() => {
    const offStart = window.electronAPI.onRecordingPrepStart(() => {
      const state = useRecordingStore.getState();
      if (!prepCapturePromiseRef.current) {
        prepCapturePromiseRef.current = ensurePrepare();
      }
      if (state.recordingMode === "recording") {
        if (recordingPrepRef.current) {
          window.electronAPI.recordingAbort();
        }
        const source = state.selectedSource;
        const hasWebcam = !!state.selectedVideoDevice;
        const title = source ? formatRecordingTitle(source) : "";
        recordingPrepRef.current = {
          recordingStartPromise: window.electronAPI.recordingStart({
            title,
            hasWebcam,
          }),
        };
      }
    });
    const offCancel = window.electronAPI.onRecordingPrepCancel(() => {
      const prepPromise = prepCapturePromiseRef.current;
      prepCapturePromiseRef.current = null;
      if (prepPromise) {
        void prepPromise.finally(() => {
          webcamStreamRef.current?.getTracks().forEach((t) => t.stop());
          webcamStreamRef.current = null;
          micStreamRef.current?.getTracks().forEach((t) => t.stop());
          micStreamRef.current = null;
        });
      }
      const prep = recordingPrepRef.current;
      if (prep) {
        recordingPrepRef.current = null;
        // recordingStart may still be in flight; await it so the abort lands after
        // the slug is created.
        void prep.recordingStartPromise
          .then(() => window.electronAPI.recordingAbort())
          .catch(() => {});
      }
    });
    return () => {
      offStart();
      offCancel();
    };
  }, [prepareCapture, ensurePrepare]);

  useEffect(() => {
    const removeListener = window.electronAPI.onOverlayAction((action) => {
      if (action === "stop") {
        stopRecording();
      } else if (action === "pause") {
        pauseRecording();
      } else if (action === "resume") {
        resumeRecording();
      } else if (action === "delete") {
        stopAndCleanup();
      } else if (action === "restart") {
        restartRecording();
      }
    });

    const removeCrashListener = window.electronAPI.onNativeRecorderCrashed(
      async () => {
        recordingPipeline.abort("recorder-crash");
        window.electronAPI.recordingAbort();
        cleanup();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        await window.electronAPI.hideRecordingOverlay();
        window.electronAPI.hideRecordingDim().catch(() => {});
        window.electronAPI.restoreRecordingDisplayMode().catch(() => {});
        await window.electronAPI.showWindow().catch(() => {});
        store.setError("Recording stopped unexpectedly");
        store.setStatus("idle");
      },
    );

    return () => {
      removeListener();
      removeCrashListener();
    };
  }, [
    store,
    cleanup,
    stopRecording,
    pauseRecording,
    resumeRecording,
    stopAndCleanup,
    restartRecording,
  ]);

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  };
}
