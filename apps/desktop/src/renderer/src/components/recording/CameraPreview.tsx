import { useEffect, useRef } from 'react'

type CameraPreviewProps = {
  deviceId: string
}

export function CameraPreview({ deviceId }: CameraPreviewProps): React.JSX.Element {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const videoEl = videoRef.current
    let stream: MediaStream | null = null

    async function startPreview(): Promise<void> {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: deviceId } }
        })
        if (videoEl) {
          videoEl.srcObject = stream
        }
      } catch (error) {
        console.error('Camera preview failed:', error)
      }
    }

    startPreview()

    return () => {
      stream?.getTracks().forEach((t) => t.stop())
      if (videoEl) {
        videoEl.srcObject = null
      }
    }
  }, [deviceId])

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className="w-full aspect-video rounded-md bg-muted object-cover"
    />
  )
}
