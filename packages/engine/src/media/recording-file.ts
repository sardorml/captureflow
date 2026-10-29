import type { ByteReader } from "./bytes";
import {
  createFmp4Reserver,
  fmp4IndexPatch,
  scanFmp4,
  type BytePatch,
} from "./fmp4-index";
import { createWebmReserver, scanWebm, webmIndexPatch } from "./webm-index";

/*
 * The recording's durable local copy: every byte lands here before it is
 * uploaded, so a crash or a lost connection leaves a file the upload can be
 * finished from. Writes are ordered; `size` only counts bytes already written.
 */
export type RecordingFile = ByteReader & {
  append(bytes: Uint8Array): Promise<void>;
  write(offset: number, bytes: Uint8Array): Promise<void>;
  truncate(size: number): Promise<void>;
};

export type RecordingFormat = "mp4" | "webm";

// Typical MediaRecorder frame length; Duration is the last block's start plus one frame.
const WEBM_LAST_FRAME_MS = 33;

export type IndexedRecording = {
  push(bytes: Uint8Array): void;
  // Settles once every pushed byte is in the file.
  flushed(): Promise<void>;
  /*
   * Writes the seek index in place. A failed index leaves a playable (if
   * slow-to-start) file, so it never throws for that.
   */
  finish(): Promise<FinishedRecording>;
};

// durationMs is read back from the file, so a recovered upload knows it too.
export type FinishedRecording = { size: number; durationMs: number | null };

export function createIndexedRecording(
  format: RecordingFormat,
  file: RecordingFile,
  onWritten: () => void = () => {},
): IndexedRecording {
  const reserver =
    format === "mp4" ? createFmp4Reserver() : createWebmReserver();
  let tail: Promise<void> = Promise.resolve();
  let failure: unknown = null;

  return {
    push(bytes) {
      for (const part of reserver.write(bytes)) {
        const copy = part.slice();
        tail = tail
          .then(() => (failure ? undefined : file.append(copy)))
          .then(onWritten, (err: unknown) => {
            failure ??= err;
          });
      }
    },
    async flushed() {
      await tail;
      if (failure) throw failure;
    },
    async finish() {
      await this.flushed();
      return finishRecordingFile(format, file);
    },
  };
}

/*
 * Brings a file to its playable end state: cut back to the last whole
 * fragment (a crash leaves a half-written one) and write the index. Safe to
 * run again on a file it already finished.
 */
export async function finishRecordingFile(
  format: RecordingFormat,
  file: RecordingFile,
): Promise<FinishedRecording> {
  let patch: BytePatch | null = null;
  let completeBytes: number | null = null;
  let durationMs: number | null = null;
  if (format === "mp4") {
    const scan = await scanFmp4(file);
    if (scan) {
      completeBytes = scan.completeBytes;
      patch = fmp4IndexPatch(scan);
      const ticks = scan.fragments.reduce((n, f) => n + f.duration, 0);
      durationMs = Math.round((ticks / scan.timescale) * 1000);
    }
  } else {
    const scan = await scanWebm(file);
    if (scan) {
      completeBytes = scan.completeBytes;
      patch = await webmIndexPatch(file, scan, WEBM_LAST_FRAME_MS).catch(
        () => null,
      );
      durationMs = Math.round(
        ((scan.durationTicks + WEBM_LAST_FRAME_MS) * scan.timecodeScale) / 1e6,
      );
    }
  }
  if (completeBytes !== null && completeBytes < file.size) {
    await file.truncate(completeBytes);
  }
  if (patch) await file.write(patch.offset, patch.bytes);
  return { size: file.size, durationMs };
}
