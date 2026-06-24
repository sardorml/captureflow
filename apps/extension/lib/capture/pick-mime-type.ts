export type ScreenMimeType = {
  mimeType: string;
  contentType: "video/mp4" | "video/webm";
};

// Preference order: H.264/MP4 (the share backend's happy-path container) when an
// OS encoder is present, otherwise VP9/VP8 WebM. The empty-mimeType fallback
// lets the browser choose and is treated as WebM output server-side.
const SCREEN_CANDIDATES: ReadonlyArray<ScreenMimeType> = [
  {
    mimeType: "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    contentType: "video/mp4",
  },
  { mimeType: "video/mp4", contentType: "video/mp4" },
  { mimeType: "video/webm;codecs=vp9,opus", contentType: "video/webm" },
  { mimeType: "video/webm;codecs=vp8,opus", contentType: "video/webm" },
  { mimeType: "video/webm", contentType: "video/webm" },
];

function defaultIsSupported(type: string): boolean {
  return (
    typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)
  );
}

export function pickScreenMimeType(
  isSupported: (type: string) => boolean = defaultIsSupported,
  candidates: ReadonlyArray<ScreenMimeType> = SCREEN_CANDIDATES,
): ScreenMimeType {
  const match = candidates.find((candidate) => isSupported(candidate.mimeType));
  return match ?? { mimeType: "", contentType: "video/webm" };
}
