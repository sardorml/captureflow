/*
 * The cross-application output contract. Every app that records through the
 * engine produces the same artifacts: screen video as fragmented MP4 (H.264
 * aspect-fit ≤1920×1080, 60 fps target, 8 Mbps target, AAC-LC audio when the
 * platform provides it), webcam as WebM, poster as JPEG. One muxer + these
 * constants = identical output on every platform.
 */
export const ENGINE_OUTPUT = {
  screen: {
    maxWidth: 1920,
    maxHeight: 1080,
    fps: 60,
    bitrate: 8_000_000,
  },
  poster: {
    mimeType: "image/jpeg",
    quality: 0.85,
  },
} as const;
