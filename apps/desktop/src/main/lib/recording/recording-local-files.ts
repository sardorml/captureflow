import { app } from "electron";
import { constants } from "node:fs";
import {
  mkdir,
  open,
  readdir,
  readFile,
  rm,
  writeFile,
  type FileHandle,
} from "node:fs/promises";
import { join } from "node:path";
import type {
  LocalFiles,
  PendingUpload,
  RecordingFile,
} from "@captureflow/engine/media";
import type { RecordingInitRequest } from "./recording-transport";

export type DesktopPendingUpload = PendingUpload<RecordingInitRequest>;

/*
 * Each recording keeps its files in userData/recordings/<slug>/ until its
 * upload is finalized: screen.mp4, webcam.webm and upload.json, which is what
 * a crashed or offline upload is finished from on the next launch.
 */
const UPLOAD_META = "upload.json";

const openHandles = new Map<string, FileHandle[]>();

function recordingsRoot(): string {
  return join(app.getPath("userData"), "recordings");
}

function recordingDir(slug: string): string {
  return join(recordingsRoot(), slug);
}

async function openFile(slug: string, name: string): Promise<RecordingFile> {
  const fh = await open(
    join(recordingDir(slug), name),
    constants.O_RDWR | constants.O_CREAT,
  );
  openHandles.set(slug, [...(openHandles.get(slug) ?? []), fh]);
  let size = (await fh.stat()).size;
  return {
    get size() {
      return size;
    },
    async read(offset, length) {
      const bytes = new Uint8Array(
        Math.max(0, Math.min(length, size - offset)),
      );
      const { bytesRead } = await fh.read(bytes, 0, bytes.byteLength, offset);
      return bytes.subarray(0, bytesRead);
    },
    async append(bytes) {
      await fh.write(bytes, 0, bytes.byteLength, size);
      size += bytes.byteLength;
    },
    async write(offset, bytes) {
      await fh.write(bytes, 0, bytes.byteLength, offset);
      size = Math.max(size, offset + bytes.byteLength);
    },
    async truncate(next) {
      await fh.truncate(next);
      size = next;
    },
  };
}

export async function closeLocalRecording(slug: string): Promise<void> {
  const handles = openHandles.get(slug) ?? [];
  openHandles.delete(slug);
  await Promise.all(handles.map((fh) => fh.close().catch(() => {})));
}

export async function removeLocalRecording(slug: string): Promise<void> {
  await closeLocalRecording(slug);
  await rm(recordingDir(slug), { recursive: true, force: true });
}

export async function openLocalRecording(
  pending: DesktopPendingUpload,
): Promise<LocalFiles> {
  await mkdir(recordingDir(pending.slug), { recursive: true });
  await writeFile(
    join(recordingDir(pending.slug), UPLOAD_META),
    JSON.stringify(pending),
  );
  const [screen, webcam] = await Promise.all([
    openFile(pending.slug, "screen.mp4"),
    pending.hasWebcam ? openFile(pending.slug, "webcam.webm") : null,
  ]);
  return {
    screen,
    webcam,
    remove: () => removeLocalRecording(pending.slug),
  };
}

// Recordings an unfinished upload left on disk. A folder without its
// metadata can't be finished, so it is removed.
export async function listLocalRecordings(): Promise<DesktopPendingUpload[]> {
  const slugs = await readdir(recordingsRoot()).catch(() => []);
  const pending: DesktopPendingUpload[] = [];
  for (const slug of slugs) {
    try {
      const meta = await readFile(
        join(recordingDir(slug), UPLOAD_META),
        "utf8",
      );
      pending.push(JSON.parse(meta) as DesktopPendingUpload);
    } catch {
      await removeLocalRecording(slug);
    }
  }
  return pending;
}
