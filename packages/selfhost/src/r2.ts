import { createHash, randomUUID } from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import {
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

type StoredMeta = {
  size: number;
  etag: string;
  uploaded: string;
  httpMetadata: R2HTTPMetadata;
  customMetadata: Record<string, string>;
};

type UploadInfo = {
  key: string;
  httpMetadata: R2HTTPMetadata;
  customMetadata: Record<string, string>;
};

type Body =
  | ReadableStream
  | ArrayBuffer
  | ArrayBufferView
  | string
  | Blob
  | null;

const UPLOAD_ID = /^[0-9a-f-]{36}$/;
const LIST_LIMIT = 1000;

/*
 * An R2Bucket over a directory: object bytes under objects/<key>, their
 * metadata under meta/<key>.json, in-flight multipart parts under
 * uploads/<uploadId>/. Each write lands in a temp file first and is renamed
 * into place, so a reader never sees half an object.
 */
export function createR2(root: string): R2Bucket {
  const objectsDir = resolve(root, "objects");
  const metaDir = resolve(root, "meta");
  const uploadsDir = resolve(root, "uploads");
  const tmpDir = resolve(root, "tmp");

  function within(base: string, key: string): string {
    if (
      !key ||
      key.includes("\0") ||
      key.includes("\\") ||
      key
        .split("/")
        .some((part) => part === "" || part === "." || part === "..")
    ) {
      throw new Error(`invalid object key: ${key}`);
    }
    const full = resolve(base, key);
    if (!full.startsWith(base + sep))
      throw new Error(`invalid object key: ${key}`);
    return full;
  }

  const objectPath = (key: string) => within(objectsDir, key);
  const metaPath = (key: string) => `${within(metaDir, key)}.json`;

  function uploadDir(uploadId: string): string {
    if (!UPLOAD_ID.test(uploadId)) throw new Error("NoSuchUpload");
    return join(uploadsDir, uploadId);
  }

  async function writeAtomically(
    target: string,
    body: Body,
  ): Promise<{ size: number; md5: string }> {
    await mkdir(tmpDir, { recursive: true });
    await mkdir(dirname(target), { recursive: true });
    const tmp = join(tmpDir, randomUUID());
    const hash = createHash("md5");
    let size = 0;
    const source = toNodeStream(body);
    source.on("data", (chunk: Buffer) => {
      hash.update(chunk);
      size += chunk.length;
    });
    try {
      await pipeline(source, createWriteStream(tmp));
      await rename(tmp, target);
    } catch (err) {
      await rm(tmp, { force: true });
      throw err;
    }
    return { size, md5: hash.digest("hex") };
  }

  async function readMeta(key: string): Promise<StoredMeta | null> {
    const path = metaPath(key);
    try {
      return JSON.parse(await readFile(path, "utf8")) as StoredMeta;
    } catch {
      return null;
    }
  }

  async function saveObject(key: string, meta: StoredMeta): Promise<R2Object> {
    await mkdir(dirname(metaPath(key)), { recursive: true });
    await writeFile(metaPath(key), JSON.stringify(meta));
    return toObject(key, meta);
  }

  async function head(key: string): Promise<R2Object | null> {
    const meta = await readMeta(key);
    return meta ? toObject(key, meta) : null;
  }

  async function get(
    key: string,
    options?: R2GetOptions,
  ): Promise<R2ObjectBody | R2Object | null> {
    const meta = await readMeta(key);
    if (!meta) return null;
    if (!conditionsHold(meta.etag, options?.onlyIf)) return toObject(key, meta);
    const span = resolveRange(options?.range, meta.size);
    const path = objectPath(key);
    const open = () =>
      meta.size === 0
        ? Readable.from([])
        : createReadStream(path, {
            start: span.offset,
            end: span.offset + span.length - 1,
          });
    return toObjectBody(key, meta, open, span);
  }

  async function put(
    key: string,
    value: Body,
    options?: R2PutOptions,
  ): Promise<R2Object> {
    const { size, md5 } = await writeAtomically(objectPath(key), value);
    return saveObject(key, {
      size,
      etag: md5,
      uploaded: new Date().toISOString(),
      httpMetadata: (options?.httpMetadata as R2HTTPMetadata | undefined) ?? {},
      customMetadata: options?.customMetadata ?? {},
    });
  }

  async function remove(keys: string | string[]): Promise<void> {
    for (const key of Array.isArray(keys) ? keys : [keys]) {
      await rm(metaPath(key), { force: true });
      await rm(objectPath(key), { force: true });
    }
  }

  async function list(options?: R2ListOptions): Promise<R2Objects> {
    const prefix = options?.prefix ?? "";
    const limit = Math.min(options?.limit ?? LIST_LIMIT, LIST_LIMIT);
    const keys = (await walk(metaDir))
      .map((file) =>
        relative(metaDir, file)
          .split(sep)
          .join("/")
          .replace(/\.json$/, ""),
      )
      .filter(
        (key) =>
          key.startsWith(prefix) && (!options?.cursor || key > options.cursor),
      )
      .sort();
    const page = keys.slice(0, limit);
    const objects: R2Object[] = [];
    for (const key of page) {
      const meta = await readMeta(key);
      if (meta) objects.push(toObject(key, meta));
    }
    const truncated = keys.length > limit;
    return truncated
      ? {
          objects,
          truncated,
          cursor: page[page.length - 1]!,
          delimitedPrefixes: [],
        }
      : { objects, truncated, delimitedPrefixes: [] };
  }

  function multipart(key: string, uploadId: string): R2MultipartUpload {
    const dir = uploadDir(uploadId);
    const info = async (): Promise<UploadInfo> => {
      try {
        return JSON.parse(
          await readFile(join(dir, "info.json"), "utf8"),
        ) as UploadInfo;
      } catch {
        throw new Error("NoSuchUpload");
      }
    };
    return {
      key,
      uploadId,
      async uploadPart(partNumber: number, value: Body) {
        const upload = await info();
        if (upload.key !== key) throw new Error("NoSuchUpload");
        const { md5 } = await writeAtomically(
          join(dir, `part-${partNumber}`),
          value,
        );
        return { partNumber, etag: md5 };
      },
      async abort() {
        await info();
        await rm(dir, { recursive: true, force: true });
      },
      async complete(parts: R2UploadedPart[]) {
        const upload = await info();
        if (upload.key !== key) throw new Error("NoSuchUpload");
        const ordered = [...parts].sort((a, b) => a.partNumber - b.partNumber);
        const digest = createHash("md5");
        for (const part of ordered)
          digest.update(Buffer.from(part.etag, "hex"));
        const { size } = await writeAtomically(
          objectPath(key),
          Readable.from(concatParts(dir, ordered)) as unknown as Body,
        );
        const saved = await saveObject(key, {
          size,
          etag: `${digest.digest("hex")}-${ordered.length}`,
          uploaded: new Date().toISOString(),
          httpMetadata: upload.httpMetadata,
          customMetadata: upload.customMetadata,
        });
        await rm(dir, { recursive: true, force: true });
        return saved;
      },
    } as unknown as R2MultipartUpload;
  }

  async function createMultipartUpload(
    key: string,
    options?: R2MultipartOptions,
  ): Promise<R2MultipartUpload> {
    objectPath(key);
    const uploadId = randomUUID();
    const dir = uploadDir(uploadId);
    await mkdir(dir, { recursive: true });
    const info: UploadInfo = {
      key,
      httpMetadata: (options?.httpMetadata as R2HTTPMetadata | undefined) ?? {},
      customMetadata: options?.customMetadata ?? {},
    };
    await writeFile(join(dir, "info.json"), JSON.stringify(info));
    return multipart(key, uploadId);
  }

  const bucket = {
    head,
    get,
    put,
    delete: remove,
    list,
    createMultipartUpload,
    resumeMultipartUpload: (key: string, uploadId: string) =>
      multipart(key, uploadId),
  };
  return bucket as unknown as R2Bucket;
}

async function* concatParts(
  dir: string,
  parts: R2UploadedPart[],
): AsyncGenerator<Buffer> {
  for (const part of parts) {
    const path = join(dir, `part-${part.partNumber}`);
    await stat(path).catch(() => {
      throw new Error(`InvalidPart: ${part.partNumber}`);
    });
    for await (const chunk of createReadStream(path)) yield chunk as Buffer;
  }
}

async function walk(dir: string): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function toNodeStream(body: Body): Readable {
  if (body === null) return Readable.from([]);
  if (body instanceof Readable) return body;
  if (typeof body === "string") return Readable.from([Buffer.from(body)]);
  if (body instanceof ArrayBuffer) return Readable.from([Buffer.from(body)]);
  if (ArrayBuffer.isView(body)) {
    return Readable.from([
      Buffer.from(body.buffer, body.byteOffset, body.byteLength),
    ]);
  }
  if (body instanceof Blob) {
    return Readable.fromWeb(
      body.stream() as import("node:stream/web").ReadableStream,
    );
  }
  return Readable.fromWeb(body as import("node:stream/web").ReadableStream);
}

function conditionsHold(
  etag: string,
  onlyIf: R2Conditional | Headers | undefined,
): boolean {
  if (!onlyIf || onlyIf instanceof Headers) return true;
  const strip = (tag: string) => tag.replace(/^W\//, "").replace(/"/g, "");
  if (onlyIf.etagDoesNotMatch && strip(onlyIf.etagDoesNotMatch) === etag)
    return false;
  if (onlyIf.etagMatches && strip(onlyIf.etagMatches) !== etag) return false;
  return true;
}

type Span = { offset: number; length: number };

// R2 throws on a range that starts past the end; callers turn that into a 416.
function resolveRange(
  range: R2Range | Headers | undefined,
  size: number,
): Span {
  if (!range || range instanceof Headers) return { offset: 0, length: size };
  if ("suffix" in range && range.suffix !== undefined) {
    const length = Math.min(range.suffix, size);
    return { offset: size - length, length };
  }
  const offset = "offset" in range ? (range.offset ?? 0) : 0;
  if (offset >= size && size > 0) throw new Error("InvalidRange");
  const requested = "length" in range ? range.length : undefined;
  return {
    offset,
    length: Math.min(requested ?? size - offset, size - offset),
  };
}

function toObject(key: string, meta: StoredMeta): R2Object {
  return {
    key,
    version: meta.etag,
    size: meta.size,
    etag: meta.etag,
    httpEtag: `"${meta.etag}"`,
    uploaded: new Date(meta.uploaded),
    httpMetadata: meta.httpMetadata,
    customMetadata: meta.customMetadata,
    checksums: { toJSON: () => ({}) },
    storageClass: "Standard",
    writeHttpMetadata(headers: Headers) {
      const http = meta.httpMetadata;
      if (http.contentType) headers.set("content-type", http.contentType);
      if (http.contentLanguage)
        headers.set("content-language", http.contentLanguage);
      if (http.contentDisposition)
        headers.set("content-disposition", http.contentDisposition);
      if (http.contentEncoding)
        headers.set("content-encoding", http.contentEncoding);
      if (http.cacheControl) headers.set("cache-control", http.cacheControl);
    },
  } as unknown as R2Object;
}

function toObjectBody(
  key: string,
  meta: StoredMeta,
  open: () => Readable,
  span: Span,
): R2ObjectBody {
  let used = false;
  const take = () => {
    if (used) throw new TypeError("Body has already been used");
    used = true;
    return open();
  };
  const bytes = async () => {
    const chunks: Buffer[] = [];
    for await (const chunk of take()) chunks.push(chunk as Buffer);
    return new Uint8Array(Buffer.concat(chunks));
  };
  let body: ReadableStream | undefined;
  return {
    ...toObject(key, meta),
    range: span,
    get body() {
      body ??= Readable.toWeb(take()) as unknown as ReadableStream;
      return body;
    },
    get bodyUsed() {
      return used;
    },
    bytes,
    arrayBuffer: async () => {
      const view = await bytes();
      return view.buffer.slice(
        view.byteOffset,
        view.byteOffset + view.byteLength,
      );
    },
    text: async () => new TextDecoder().decode(await bytes()),
    json: async () =>
      JSON.parse(new TextDecoder().decode(await bytes())) as unknown,
    blob: async () =>
      new Blob([await bytes()], { type: meta.httpMetadata.contentType }),
  } as unknown as R2ObjectBody;
}
