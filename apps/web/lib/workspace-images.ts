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

export type ImageUploadCopy = {
  missing: string;
  tooLarge: string;
  badType: string;
};

// A form field that should hold a small image; `copy` is its error text.
export async function readImageUpload(
  file: unknown,
  copy: ImageUploadCopy,
): Promise<ImageUpload> {
  if (!(file instanceof Blob) || file.size === 0) {
    return { ok: false, error: copy.missing };
  }
  if (file.size > WORKSPACE_IMAGE_MAX_BYTES) {
    return { ok: false, error: copy.tooLarge };
  }
  const ext = IMAGE_EXT.get(file.type);
  if (!ext) {
    return { ok: false, error: copy.badType };
  }
  const buffer = (await file.arrayBuffer()) as ArrayBuffer;
  return { ok: true, ext, mime: file.type, buffer };
}
