export const WORKSPACE_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

export const WORKSPACE_IMAGE_ACCEPT =
  "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

const IMAGE_EXT = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

export type ImageUpload =
  | { ok: true; ext: string; mime: string; buffer: ArrayBuffer }
  | { ok: false; error: string };

// A form field that should hold a small image; `what` names it in errors.
export async function readImageUpload(
  file: unknown,
  what: string,
): Promise<ImageUpload> {
  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false, error: "Pick an image file" };
  }
  if (file.size > WORKSPACE_IMAGE_MAX_BYTES) {
    return { ok: false, error: `${what} must be 2 MB or smaller` };
  }
  const ext = IMAGE_EXT.get(file.type);
  if (!ext) {
    return {
      ok: false,
      error: `${what} must be PNG, JPEG, WebP, GIF, or SVG`,
    };
  }
  const buffer = (await file.arrayBuffer()) as ArrayBuffer;
  return { ok: true, ext, mime: file.type, buffer };
}
