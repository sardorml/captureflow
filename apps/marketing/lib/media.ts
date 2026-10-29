export type MediaKind = "image" | "gif" | "video";

export const MEDIA_KINDS: readonly MediaKind[] = ["image", "gif", "video"];

export const KIND_LABEL = {
  image: "Image",
  gif: "GIF",
  video: "Video",
} as const satisfies Record<MediaKind, string>;

export const KIND_DIR = {
  image: "images",
  gif: "gifs",
  video: "videos",
} as const satisfies Record<MediaKind, string>;

export const KIND_EXT = {
  image: "png",
  gif: "gif",
  video: "mp4",
} as const satisfies Record<MediaKind, string>;

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  gif: "image/gif",
  mp4: "video/mp4",
};

export function isMediaKind(value: unknown): value is MediaKind {
  return value === "image" || value === "gif" || value === "video";
}

export function kindFromFile(file: string): MediaKind | null {
  const ext = extOf(file);
  const match = MEDIA_KINDS.find((kind) => KIND_EXT[kind] === ext);
  return match ?? null;
}

export function mimeForFile(file: string): string {
  return MIME_BY_EXT[extOf(file)] ?? "application/octet-stream";
}

function extOf(file: string): string {
  return file.slice(file.lastIndexOf(".") + 1).toLowerCase();
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function outputName(kind: MediaKind, slug: string, at: Date): string {
  const stamp =
    `${at.getFullYear()}${pad(at.getMonth() + 1)}${pad(at.getDate())}` +
    `-${pad(at.getHours())}${pad(at.getMinutes())}${pad(at.getSeconds())}`;
  return `${slug}-${stamp}.${KIND_EXT[kind]}`;
}

// Inverse of outputName: "launch-teaser-20261029-101500.gif" → "launch-teaser".
export function slugFromOutput(file: string): string {
  const base = file.slice(file.lastIndexOf("/") + 1).replace(/\.[^.]+$/, "");
  return base.replace(/-\d{8}-\d{6}$/, "");
}
