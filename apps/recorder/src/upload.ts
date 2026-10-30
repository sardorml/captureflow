import { constants } from "node:fs";
import { mkdtemp, open, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type {
  LocalFiles,
  RecordingFile,
  RecordingUploadTransport,
  UploadInitResponse,
} from "@captureflow/engine/media";

export type AgentInitRequest = {
  contentType: "video/mp4";
  source: "instant";
  preset: "recording";
  client: "agent";
  hasWebcam: false;
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
};

// Who the recording uploads as: a device token minted for this one session.
export type UploadCredentials = {
  apiBase: string;
  shareBase: string;
  deviceId: string;
  token: string;
};

class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
  }
}

export type AgentTransport = RecordingUploadTransport<AgentInitRequest> & {
  uploadAudioPart(
    slug: string,
    partNumber: number,
    bytes: Uint8Array,
  ): Promise<void>;
  uploadPoster(slug: string, jpeg: Uint8Array): Promise<void>;
  transcribe(req: {
    slug: string;
    language: string;
    parts: { partNumber: number; startMs: number; endMs: number }[];
  }): Promise<void>;
};

export function createTransport(creds: UploadCredentials): AgentTransport {
  const headers = (extra: Record<string, string> = {}) => ({
    "x-captureflow-device": creds.deviceId,
    authorization: `Bearer ${creds.token}`,
    ...extra,
  });
  const parse = async <T>(res: Response, path: string): Promise<T> => {
    if (res.ok) return (await res.json()) as T;
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    throw new ApiError(
      `${path}: ${body.error ?? res.status}`,
      res.status,
      body.code,
    );
  };
  const postJson = async <T>(path: string, body: unknown): Promise<T> =>
    parse<T>(
      await fetch(`${creds.apiBase}${path}`, {
        method: "POST",
        headers: headers({ "content-type": "application/json" }),
        body: JSON.stringify(body),
      }),
      path,
    );
  return {
    init: (req) => postJson<UploadInitResponse>("/init", req),
    async uploadSegment(slug, stream, offset, bytes, signal) {
      const path = `/segment?slug=${encodeURIComponent(slug)}&stream=${stream}&offset=${offset}`;
      await parse(
        await fetch(`${creds.apiBase}${path}`, {
          method: "POST",
          headers: headers({ "content-type": "application/octet-stream" }),
          body: Uint8Array.from(bytes).buffer,
          signal,
        }),
        path,
      );
    },
    async uploadedThrough(slug, stream) {
      const path = `/segment?slug=${encodeURIComponent(slug)}&stream=${stream}`;
      const res = await fetch(`${creds.apiBase}${path}`, {
        headers: headers(),
      });
      return (await parse<{ covered: number }>(res, path)).covered;
    },
    finalizeScreen: (req) => postJson<{ url: string }>("/finalize", req),
    async finalizeWebcam(req) {
      await postJson("/webcam-finalize", req);
    },
    async abort(req) {
      await postJson("/abort", req);
    },
    async uploadAudioPart(slug, partNumber, bytes) {
      const path = `/audio-part?slug=${encodeURIComponent(slug)}&part=${partNumber}`;
      await parse(
        await fetch(`${creds.apiBase}${path}`, {
          method: "POST",
          headers: headers({ "content-type": "audio/webm" }),
          body: Uint8Array.from(bytes).buffer,
        }),
        path,
      );
    },
    async uploadPoster(slug, jpeg) {
      const path = `/poster?slug=${encodeURIComponent(slug)}`;
      await parse(
        await fetch(`${creds.apiBase}${path}`, {
          method: "POST",
          headers: headers({ "content-type": "image/jpeg" }),
          body: Uint8Array.from(jpeg).buffer,
        }),
        path,
      );
    },
    async transcribe(req) {
      await postJson("/transcribe", req);
    },
    async state(slug) {
      const path = `/state?slug=${encodeURIComponent(slug)}`;
      return parse<{ state: string }>(
        await fetch(`${creds.apiBase}${path}`),
        path,
      );
    },
    viewUrl: (slug) => `${creds.shareBase}/r/${slug}`,
  };
}

async function openFile(
  path: string,
): Promise<{ file: RecordingFile; close(): Promise<void> }> {
  const fh = await open(path, constants.O_RDWR | constants.O_CREAT);
  let size = 0;
  const file: RecordingFile = {
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
  return { file, close: () => fh.close() };
}

// The container's disk stands in for the device copy the other recorders keep.
export async function openTempFiles(): Promise<LocalFiles> {
  const dir = await mkdtemp(join(tmpdir(), "captureflow-rec-"));
  const screen = await openFile(join(dir, "screen.mp4"));
  return {
    screen: screen.file,
    webcam: null,
    async remove() {
      await screen.close().catch(() => {});
      await rm(dir, { recursive: true, force: true });
    },
  };
}
