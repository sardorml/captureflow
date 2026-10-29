/*
 * The recording's files in the origin-private file system. Sync access
 * handles exist only in dedicated workers, and they are what makes a write
 * durable as it happens: an async writable only lands on close(), so a crash
 * mid-recording would throw the whole file away.
 */

export type LocalFileRequest =
  | { id: number; op: "open"; path: string[] }
  | { id: number; op: "append"; path: string[]; bytes: Uint8Array }
  | {
      id: number;
      op: "write";
      path: string[];
      offset: number;
      bytes: Uint8Array;
    }
  | { id: number; op: "read"; path: string[]; offset: number; length: number }
  | { id: number; op: "truncate"; path: string[]; size: number }
  | { id: number; op: "close"; path: string[] }
  | { id: number; op: "remove"; dir: string[] }
  | { id: number; op: "list"; dir: string[] };

export type LocalFileResponse =
  | {
      id: number;
      ok: true;
      size?: number;
      bytes?: Uint8Array;
      names?: string[];
    }
  | { id: number; ok: false; error: string };

const handles = new Map<string, FileSystemSyncAccessHandle>();

async function directory(parts: string[], create: boolean) {
  let dir = await navigator.storage.getDirectory();
  for (const part of parts)
    dir = await dir.getDirectoryHandle(part, { create });
  return dir;
}

async function handle(path: string[]): Promise<FileSystemSyncAccessHandle> {
  const key = path.join("/");
  const open = handles.get(key);
  if (open) return open;
  const dir = await directory(path.slice(0, -1), true);
  const file = await dir.getFileHandle(path[path.length - 1]!, {
    create: true,
  });
  const sync = await file.createSyncAccessHandle();
  handles.set(key, sync);
  return sync;
}

function closeUnder(prefix: string): void {
  for (const [key, sync] of handles) {
    if (key === prefix || key.startsWith(`${prefix}/`)) {
      sync.close();
      handles.delete(key);
    }
  }
}

async function run(
  req: LocalFileRequest,
): Promise<Omit<LocalFileResponse & { ok: true }, "id" | "ok">> {
  switch (req.op) {
    case "open": {
      return { size: (await handle(req.path)).getSize() };
    }
    case "append": {
      const sync = await handle(req.path);
      sync.write(req.bytes, { at: sync.getSize() });
      sync.flush();
      return { size: sync.getSize() };
    }
    case "write": {
      const sync = await handle(req.path);
      sync.write(req.bytes, { at: req.offset });
      sync.flush();
      return { size: sync.getSize() };
    }
    case "read": {
      const sync = await handle(req.path);
      const length = Math.max(
        0,
        Math.min(req.length, sync.getSize() - req.offset),
      );
      const bytes = new Uint8Array(length);
      sync.read(bytes, { at: req.offset });
      return { bytes };
    }
    case "truncate": {
      const sync = await handle(req.path);
      sync.truncate(req.size);
      sync.flush();
      return { size: sync.getSize() };
    }
    case "close": {
      closeUnder(req.path.join("/"));
      return {};
    }
    case "remove": {
      closeUnder(req.dir.join("/"));
      const parent = await directory(req.dir.slice(0, -1), true);
      await parent
        .removeEntry(req.dir[req.dir.length - 1]!, { recursive: true })
        .catch(() => {});
      return {};
    }
    case "list": {
      const dir = await directory(req.dir, true);
      const names: string[] = [];
      for await (const name of (
        dir as unknown as { keys(): AsyncIterable<string> }
      ).keys()) {
        names.push(name);
      }
      return { names };
    }
  }
}

// Requests run one at a time, so an append never interleaves with a read.
let queue: Promise<unknown> = Promise.resolve();

self.onmessage = (event: MessageEvent<LocalFileRequest>) => {
  const req = event.data;
  queue = queue.then(async () => {
    try {
      const result = await run(req);
      const transfer = result.bytes ? [result.bytes.buffer] : [];
      (self as unknown as Worker).postMessage(
        { id: req.id, ok: true, ...result },
        transfer,
      );
    } catch (err) {
      (self as unknown as Worker).postMessage({
        id: req.id,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });
};
