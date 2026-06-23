import { useRef, useCallback, useEffect } from 'react'
import { useRecordingStore } from '../stores/recording-store'
import { acquireMicCapture, acquireWebcamCapture } from '../lib/recording/webcam-capture'
import { sharePipeline, SHARE_CAP_MS } from '../lib/share/share-pipeline'
import { ShareWebcamUploader } from '../lib/share/share-webcam-uploader'
import { track } from '../lib/analytics'
import {
  getWindowId,
  isWindowSource,
  type CaptureSource,
  type WindowBounds
} from '../../../shared/types'

function formatShareTitle(source: CaptureSource | null): string | null {
  if (!source) return null
  if (isWindowSource(source)) {
    return source.ownerName?.trim() || source.name?.trim() || null
  }
  return source.name?.trim() || null
}

export function useRecorder(): {
  startRecording: () => void
  stopRecording: () => void
  pauseRecording: () => void
  resumeRecording: () => void
} {
  const store = useRecordingStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const webcamStreamRef = useRef<MediaStream | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const shareWebcamUploaderRef = useRef<ShareWebcamUploader | null>(null)
  const shareEditUrlRef = useRef<string | null>(null)
  type SharePrep = {
    shareStartPromise: Promise<import('../../../shared/types').ShareStartResult>
  }
  const sharePrepRef = useRef<SharePrep | null>(null)
  const prepCapturePromiseRef = useRef<Promise<void> | null>(null)
  /*
   * Dedup guard distinct from prepCapturePromiseRef (which the cancel handler
   * nulls): survives a cancel so a record-right-after-cancel can't fire a
   * second getUserMedia in parallel and strand the camera/mic device.
   */
  const prepareInFlightRef = useRef<Promise<void> | null>(null)
  const trackingDataRef = useRef<unknown>(null)

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    webcamStreamRef.current?.getTracks().forEach((t) => t.stop())
    webcamStreamRef.current = null
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    if (shareWebcamUploaderRef.current) {
      shareWebcamUploaderRef.current.abort()
      shareWebcamUploaderRef.current = null
    }
  }, [])

  const handleNativeRecordingStopped = useCallback(
    async (
      _screenPath: string,
      _systemAudioPath: string | null,
      _nativeDuration?: number,
      _nativeWidth?: number,
      _nativeHeight?: number
    ): Promise<void> => {
      store.setStatus('saving')

      await window.electronAPI.hideRecordingOverlay()
      window.electronAPI.hideRecordingDim().catch(() => {})
      window.electronAPI.hideWebcamBubble().catch(() => {})
      window.electronAPI.restoreRecordingDisplayMode().catch(() => {})

      const shareWebcamUploader = shareWebcamUploaderRef.current
      shareWebcamUploaderRef.current = null

      let webcamTotalBytes = 0
      if (shareWebcamUploader) {
        try {
          const res = await shareWebcamUploader.stop()
          webcamTotalBytes = res.totalBytes
        } catch (err) {
          window.electronAPI.log('warn', 'share', `share-webcam stop failed: ${String(err)}`)
        }
      }
      cleanup()

      const shareResult = await sharePipeline.finish()
      const shareState = sharePipeline.getState()

      const trackingResult = await window.electronAPI.stopCursorTracking().catch(() => null)
      if (trackingResult?.data) {
        trackingDataRef.current = trackingResult.data
      }

      if (shareResult) {
        window.electronAPI.log(
          'info',
          'share',
          `finalized: ${shareResult.sizeBytes}B, ${shareResult.encodedFrames}fr, ${shareResult.durationMs}ms`
        )
        const editUrl = shareEditUrlRef.current
        if (editUrl) window.electronAPI.shareReadyOpenLink(editUrl)
        if (shareResult.posterBlob) {
          void shareResult.posterBlob
            .arrayBuffer()
            .then((buf) => window.electronAPI.shareUploadPoster(buf))
            .catch((err) =>
              window.electronAPI.log('warn', 'share', `poster upload failed: ${String(err)}`)
            )
        }
        void window.electronAPI
          .shareFinish({
            durationMs: shareResult.durationMs,
            screenTotalBytes: shareResult.sizeBytes,
            webcamTotalBytes
          })
          .then((finishRes) => {
            if (!finishRes.ok) {
              window.electronAPI.log(
                'warn',
                'share',
                `shareFinish failed: ${finishRes.error}` +
                  (finishRes.partialUrl ? ` (partial: ${finishRes.partialUrl})` : '')
              )
              void window.electronAPI.shareFailureOpen(
                finishRes.partialUrl
                  ? { kind: 'partial', message: finishRes.error, url: finishRes.partialUrl }
                  : { kind: 'no-link', message: finishRes.error }
              )
            }
          })
      } else if (shareState.status === 'over-cap') {
        window.electronAPI.log('info', 'share', 'over-cap; aborting upload')
        window.electronAPI.shareAbort()
      } else {
        const reason =
          shareState.status === 'aborted' && shareState.reason
            ? shareState.reason
            : 'Recording could not be encoded.'
        window.electronAPI.log(
          'info',
          'share',
          `no encoder result; state=${shareState.status} reason=${reason}`
        )
        window.electronAPI.shareAbort()
        await window.electronAPI.shareFailureOpen({
          kind: 'init-failed',
          message: reason
        })
      }
      store.setStatus('idle')
    },
    [store, cleanup]
  )

  const prepareCapture = useCallback(async () => {
    const { selectedAudioDevice, selectedVideoDevice } = useRecordingStore.getState()

    if (selectedVideoDevice) {
      const webcamCapture = await acquireWebcamCapture(selectedVideoDevice)
      if (webcamCapture) {
        webcamStreamRef.current = webcamCapture.stream
      }
    }

    if (selectedAudioDevice) {
      const micCapture = await acquireMicCapture(selectedAudioDevice)
      if (micCapture) {
        micStreamRef.current = micCapture.stream
      }
    }
  }, [])

  const ensurePrepare = useCallback((): Promise<void> => {
    if (prepareInFlightRef.current) return prepareInFlightRef.current
    const p = prepareCapture().finally(() => {
      if (prepareInFlightRef.current === p) prepareInFlightRef.current = null
    })
    prepareInFlightRef.current = p
    return p
  }, [prepareCapture])

  const beginCapture = useCallback(async () => {
    const { selectedSource, systemAudioEnabled, recordingMode } = useRecordingStore.getState()
    const source = selectedSource
    if (!source) return
    const shareMode = recordingMode === 'share'

    try {
      window.electronAPI.showRecordingOverlay()
      await window.electronAPI.hideWindow()

      const focusPid = isWindowSource(source) ? source.pid : undefined
      window.electronAPI.focusAppByPid(focusPid).catch(() => {})

      if (source.hideDesktopIcons) {
        await window.electronAPI
          .applyRecordingDisplayMode({ hideDesktopIcons: true })
          .catch(() => {})
      }

      const outputDir = await window.electronAPI.getRecordingsDir()
      const displayId = source.displayId ? parseInt(source.displayId, 10) : undefined
      const windowId = getWindowId(source)
      const includeSelfWindows =
        import.meta.env.DEV && localStorage.getItem('captureflow.dev.recordSelf') === '1'
      const cropRect: WindowBounds | undefined =
        windowId === undefined ? source.windowBounds : undefined

      if (shareMode) {
        // Share prep was kicked off at countdown start; if the prep ref is
        // missing (cancel race or non-overlay entry path) run the inline
        // fallback so we never lose the slug.
        const prep = sharePrepRef.current
        sharePrepRef.current = null
        const title = formatShareTitle(source)
        const hasWebcam = webcamStreamRef.current !== null
        const startRes = await (prep?.shareStartPromise ??
          window.electronAPI.shareStart({ title, hasWebcam }))
        if (!startRes.ok) {
          window.electronAPI.log('warn', 'share', `shareStart failed: ${startRes.error}`)
          throw new Error(startRes.error)
        }
        shareEditUrlRef.current = startRes.editUrl

        // audioExpected holds encoder init until the first audio-format event
        // arrives — required because mp4-muxer locks its track set at
        // construction time.
        sharePipeline.arm({ audioExpected: systemAudioEnabled })
      }

      const result = await window.electronAPI.startNativeRecording({
        outputDir,
        displayId,
        windowId,
        fps: 120,
        captureAudio: systemAudioEnabled,
        includeSelfWindows,
        cropRect,
        share: shareMode
      })
      const windowBounds: WindowBounds | undefined = result?.windowBounds ?? source.windowBounds
      const wallClockMs: number | undefined = result?.wallClockMs

      await window.electronAPI
        .startCursorTracking(source.displayId, windowBounds, wallClockMs)
        .catch(() => {})

      // Start the uploader only after native confirms its session started, so
      // MediaRecorder's wall-clock start aligns with the screen MP4's;
      // starting earlier surfaces as mic lag at playback time 0.
      if (shareMode && webcamStreamRef.current) {
        const uploader = new ShareWebcamUploader()
        uploader.start({
          webcamStream: webcamStreamRef.current,
          micStream: micStreamRef.current
        })
        shareWebcamUploaderRef.current = uploader
      }

      store.setStatus('recording')
      store.setElapsedTime(0)
      window.electronAPI.showRecordingOverlay({
        startedAt: wallClockMs ?? Date.now(),
        capMs: shareMode ? SHARE_CAP_MS : undefined
      })
      const dimBounds = windowBounds ?? source.windowBounds
      const dimRadius = result?.cornerRadius ?? source.cornerRadius
      if (dimBounds) {
        window.electronAPI.showRecordingDim(dimBounds, dimRadius).catch(() => {})
      }
      window.electronAPI.playSound('Blow').catch(() => {})

      timerRef.current = setInterval(() => {
        const state = useRecordingStore.getState()
        if (state.status === 'recording') {
          store.setElapsedTime(state.elapsedTime + 1)
        }
      }, 1000)
    } catch (error) {
      console.error('Failed to start recording:', error)
      sharePipeline.abort('start-failed')
      window.electronAPI.shareAbort()
      cleanup()
      await window.electronAPI.hideRecordingOverlay()
      window.electronAPI.hideRecordingDim().catch(() => {})
      window.electronAPI.restoreRecordingDisplayMode().catch(() => {})
      await window.electronAPI.showWindow()
      store.setError(error instanceof Error ? error.message : 'Failed to start recording')
      store.setStatus('idle')
    }
  }, [store, cleanup])

  const startRecording = useCallback(async () => {
    const { selectedSource, selectedVideoDevice, selectedAudioDevice } =
      useRecordingStore.getState()

    let source = selectedSource
    if (!source) {
      const { sources } = useRecordingStore.getState()
      const screenSource = sources.find(
        (s) => s.displayId !== '' || /screen|entire|display/i.test(s.name)
      )
      source = screenSource ?? sources[0] ?? null
      if (source) {
        useRecordingStore.getState().setSelectedSource(source)
      }
    }
    if (!source) return

    const perms = await window.electronAPI.getPermissions()
    if (selectedVideoDevice && perms.camera !== 'granted') {
      const granted = await window.electronAPI.requestMediaPermission('camera')
      if (!granted) return
    }
    if (selectedAudioDevice && perms.microphone !== 'granted') {
      const granted = await window.electronAPI.requestMediaPermission('microphone')
      if (!granted) return
    }

    store.setStatus('preparing')

    try {
      const pending = prepCapturePromiseRef.current
      prepCapturePromiseRef.current = null
      await (pending ?? ensurePrepare())
      await beginCapture()
      const recState = useRecordingStore.getState()
      track('recording_started', {
        mode: recState.recordingMode,
        has_webcam: recState.selectedVideoDevice !== null,
        has_mic: recState.selectedAudioDevice !== null
      })
    } catch (error) {
      console.error('Failed to start recording:', error)
      cleanup()
      store.setError(error instanceof Error ? error.message : 'Failed to start recording')
      store.setStatus('idle')
    }
  }, [store, ensurePrepare, beginCapture, cleanup])

  const stopRecording = useCallback(() => {
    window.electronAPI.playSound('Bottle').catch(() => {})
    window.electronAPI
      .stopNativeRecording()
      .then((result) => {
        track('recording_completed', {
          mode: useRecordingStore.getState().recordingMode,
          duration_sec: Math.round(result.duration)
        })
        handleNativeRecordingStopped(
          result.path,
          result.systemAudioPath ?? null,
          result.duration,
          result.width,
          result.height
        )
      })
      .catch(() => {})
  }, [handleNativeRecordingStopped])

  const pauseRecording = useCallback(() => {
    window.electronAPI.pauseNativeRecording()
    window.electronAPI.pauseCursorTracking().catch(() => {})
    store.setStatus('paused')
  }, [store])

  const resumeRecording = useCallback(() => {
    window.electronAPI.resumeNativeRecording()
    window.electronAPI.resumeCursorTracking().catch(() => {})
    store.setStatus('recording')
  }, [store])

  const stopAndCleanup = useCallback(() => {
    if (useRecordingStore.getState().status === 'paused') {
      window.electronAPI.resumeNativeRecording()
    }

    sharePipeline.abort('cancelled')
    window.electronAPI.shareAbort()
    window.electronAPI
      .stopNativeRecording()
      .catch(() => {})
      .finally(() => {
        cleanup()
      })

    window.electronAPI.hideRecordingOverlay().catch(() => {})
    window.electronAPI.hideWebcamBubble().catch(() => {})
    window.electronAPI.hideRecordingDim().catch(() => {})
    window.electronAPI.restoreRecordingDisplayMode().catch(() => {})
    window.electronAPI.showWindow().catch(() => {})
    useRecordingStore.getState().setStatus('idle')

    const device = useRecordingStore.getState().selectedVideoDevice
    if (device) {
      window.electronAPI.showWebcamBubble(device).catch(() => {})
    }
  }, [cleanup])

  const deleteRecording = useCallback(() => {
    stopAndCleanup()
    window.electronAPI.deleteCurrentSession().catch(() => {})
  }, [stopAndCleanup])

  const restartRecording = useCallback(() => {
    stopAndCleanup()
    window.electronAPI
      .deleteCurrentSession()
      .catch(() => {})
      .finally(() => {
        setTimeout(() => startRecording(), 300)
      })
  }, [stopAndCleanup, startRecording])

  useEffect(() => {
    sharePipeline.attach()
  }, [])

  useEffect(() => {
    const offStart = window.electronAPI.onSharePrepStart(() => {
      const state = useRecordingStore.getState()
      if (!prepCapturePromiseRef.current) {
        prepCapturePromiseRef.current = ensurePrepare()
      }
      if (state.recordingMode === 'share') {
        if (sharePrepRef.current) {
          window.electronAPI.shareAbort()
        }
        const source = state.selectedSource
        const hasWebcam = !!state.selectedVideoDevice
        const title = source ? formatShareTitle(source) : ''
        sharePrepRef.current = {
          shareStartPromise: window.electronAPI.shareStart({ title, hasWebcam })
        }
      }
    })
    const offCancel = window.electronAPI.onSharePrepCancel(() => {
      const prepPromise = prepCapturePromiseRef.current
      prepCapturePromiseRef.current = null
      if (prepPromise) {
        void prepPromise.finally(() => {
          webcamStreamRef.current?.getTracks().forEach((t) => t.stop())
          webcamStreamRef.current = null
          micStreamRef.current?.getTracks().forEach((t) => t.stop())
          micStreamRef.current = null
        })
      }
      const prep = sharePrepRef.current
      if (prep) {
        sharePrepRef.current = null
        // shareStart may still be in flight; await it so the abort lands after
        // the slug is created.
        void prep.shareStartPromise.then(() => window.electronAPI.shareAbort()).catch(() => {})
      }
    })
    return () => {
      offStart()
      offCancel()
    }
  }, [prepareCapture, ensurePrepare])

  useEffect(() => {
    const removeListener = window.electronAPI.onOverlayAction((action) => {
      if (action === 'stop') {
        stopRecording()
      } else if (action === 'pause') {
        pauseRecording()
      } else if (action === 'resume') {
        resumeRecording()
      } else if (action === 'delete') {
        deleteRecording()
      } else if (action === 'restart') {
        restartRecording()
      }
    })

    const removeCrashListener = window.electronAPI.onNativeRecorderCrashed(async () => {
      sharePipeline.abort('recorder-crash')
      window.electronAPI.shareAbort()
      cleanup()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      await window.electronAPI.hideRecordingOverlay()
      window.electronAPI.hideRecordingDim().catch(() => {})
      window.electronAPI.restoreRecordingDisplayMode().catch(() => {})
      await window.electronAPI.showWindow().catch(() => {})
      store.setError('Recording stopped unexpectedly')
      store.setStatus('idle')
    })

    return () => {
      removeListener()
      removeCrashListener()
    }
  }, [
    store,
    cleanup,
    stopRecording,
    pauseRecording,
    resumeRecording,
    deleteRecording,
    restartRecording
  ])

  return {
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording
  }
}
