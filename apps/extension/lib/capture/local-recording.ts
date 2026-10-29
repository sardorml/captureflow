import type { RecordingFile } from "@captureflow/engine/media";
import type { LocalFileRequest, LocalFileResponse } from "./local-file.worker";
import LocalFileWorker from "./local-file.worker?worker";

/*
 * Each recording keeps its screen and camera files on this device until its
 * upload is finalized: recordings/<slug>/screen.mp4 and webcam.webm. They are
 * what a crashed or offline upload is finished from.
 */
const ROOT = "recordings";

type WithoutId<T> = T extends unknown ? Omit<T, "id"> : never;
type Request = WithoutId<LocalFileRequest>;

let worker: Worker | null = null;
let nextId = 1;
const waiting = new Map<number, (res: LocalFileResponse) => void>();

function call(req: Request) {
  worker ??= (() => {
    const w = new LocalFileWorker();
    w.onmessage = (event: MessageEvent<LocalFileResponse>) => {
      waiting.get(event.data.id)?.(event.data);
      waiting.delete(event.data.id);
    };
    return w;
  })();
  const id = nextId++;
  return new Promise<LocalFileResponse & { ok: true }>((resolve, reject) => {
    waiting.set(id, (res) =>
      res.ok
        ? resolve(res)
        : reject(new Error(`Local recording file: ${res.error}`)),
    );
    worker!.postMessage({ ...req, id });
  });
}

async function openFile(path: string[]): Promise<RecordingFile> {
  let size = (await call({ op: "open", path })).size ?? 0;
  return {
    get size() {
      return size;
    },
    async read(offset, length) {
      return (
        (await call({ op: "read", path, offset, length })).bytes ??
        new Uint8Array(0)
      );
    },
    async append(bytes) {
      size = (await call({ op: "append", path, bytes })).size ?? size;
    },
    async write(offset, bytes) {
      size = (await call({ op: "write", path, offset, bytes })).size ?? size;
    },
    async truncate(next) {
      size = (await call({ op: "truncate", path, size: next })).size ?? next;
    },
  };
}

export type LocalRecording = {
  screen: RecordingFile;
  webcam: RecordingFile | null;
  remove(): Promise<void>;
};

export async function openLocalRecording(
  slug: string,
  hasWebcam: boolean,
): Promise<LocalRecording> {
  const dir = [ROOT, slug];
  const [screen, webcam] = await Promise.all([
    openFile([...dir, "screen.mp4"]),
    hasWebcam ? openFile([...dir, "webcam.webm"]) : Promise.resolve(null),
  ]);
  return {
    screen,
    webcam,
    remove: async () => {
      await call({ op: "remove", dir });
    },
  };
}

export async function listLocalRecordings(): Promise<string[]> {
  return (await call({ op: "list", dir: [ROOT] })).names ?? [];
}

export async function removeLocalRecording(slug: string): Promise<void> {
  await call({ op: "remove", dir: [ROOT, slug] });
}
