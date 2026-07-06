import { ENGINE_OUTPUT } from "../contract";

export type PosterSource = {
  codec: string;
  codedWidth: number;
  codedHeight: number;
  description?: BufferSource;
  keyChunk: { timestamp: number; duration: number; data: Uint8Array };
};

/** One-shot decode of a keyframe → JPEG blob for the viewer-link OG poster. */
export function decodePosterJpeg(source: PosterSource): Promise<Blob> {
  const { codec, codedWidth, codedHeight, description, keyChunk } = source;
  return new Promise<Blob>((resolve, reject) => {
    const decoder = new VideoDecoder({
      output: (frame) => {
        try {
          const canvas = new OffscreenCanvas(codedWidth, codedHeight);
          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) throw new Error("poster: 2d ctx unavailable");
          ctx.drawImage(frame, 0, 0, codedWidth, codedHeight);
          resolve(
            canvas.convertToBlob({
              type: ENGINE_OUTPUT.poster.mimeType,
              quality: ENGINE_OUTPUT.poster.quality,
            }),
          );
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        } finally {
          frame.close();
          try {
            decoder.close();
          } catch {
            /* already closed */
          }
        }
      },
      error: (err) => reject(err),
    });
    decoder.configure({
      codec,
      codedWidth,
      codedHeight,
      hardwareAcceleration: "prefer-hardware",
      description,
    });
    decoder.decode(
      new EncodedVideoChunk({
        type: "key",
        timestamp: keyChunk.timestamp,
        duration: keyChunk.duration,
        data: keyChunk.data,
      }),
    );
    // Forces the single buffered frame out; rejects once close() lands, which is fine.
    decoder.flush().catch(() => {});
  });
}
