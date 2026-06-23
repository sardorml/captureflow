import { useEffect, useCallback } from 'react'
import { useRecordingStore } from '../stores/recording-store'

export function useMediaDevices(): void {
  const setAudioDevices = useRecordingStore((s) => s.setAudioDevices)
  const setVideoDevices = useRecordingStore((s) => s.setVideoDevices)

  const enumerate = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()

      const audio = devices
        .filter((d) => d.kind === 'audioinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Microphone ${d.deviceId.slice(0, 5)}`
        }))

      const video = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${d.deviceId.slice(0, 5)}`
        }))

      setAudioDevices(audio)
      setVideoDevices(video)

      // Guard on a real enumeration (at least one non-empty deviceId):
      // pre-permission enumerateDevices returns blank ids, so clearing then
      // would wipe a valid selection.
      {
        const store = useRecordingStore.getState()
        const realVideo = video.some((d) => d.deviceId !== '')
        if (
          store.selectedVideoDevice &&
          realVideo &&
          !video.some((d) => d.deviceId === store.selectedVideoDevice)
        ) {
          store.setSelectedVideoDevice(null)
        }
        const realAudio = audio.some((d) => d.deviceId !== '')
        if (
          store.selectedAudioDevice &&
          realAudio &&
          !audio.some((d) => d.deviceId === store.selectedAudioDevice)
        ) {
          store.setSelectedAudioDevice(null)
        }
      }

      try {
        const { selectedAudioDevice, selectedVideoDevice } = useRecordingStore.getState()
        const micLabel = audio.find((d) => d.deviceId === selectedAudioDevice)?.label
        if (micLabel) localStorage.setItem('captureflow-mic-label', micLabel)
        const camLabel = video.find((d) => d.deviceId === selectedVideoDevice)?.label
        if (camLabel) localStorage.setItem('captureflow-cam-label', camLabel)
      } catch {
        // localStorage unavailable
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  }, [setAudioDevices, setVideoDevices])

  useEffect(() => {
    enumerate()
    navigator.mediaDevices.addEventListener('devicechange', enumerate)
    return () => navigator.mediaDevices.removeEventListener('devicechange', enumerate)
  }, [enumerate])
}
