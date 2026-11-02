import { createServer, type IncomingMessage } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { chromium, type Browser } from "playwright";
import {
  decodeAudio,
  SessionError,
  startSession,
  type Action,
  type Session,
  type StartRequest,
  type UploadCredentials,
} from "@captureflow/agent-recorder";

const PORT = Number(process.env.PORT ?? 8080);
const SECRET = process.env.RECORDER_SECRET ?? "";
const MAX_BODY_BYTES = 8 * 1024 * 1024;

const sessions = new Map<string, Session>();
let browser: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  browser ??= chromium
    .launch({
      headless: true,
      args: [
        "--disable-dev-shm-usage",
        "--autoplay-policy=no-user-gesture-required",
      ],
    })
    .then((launched) => {
      // A crashed browser is relaunched for the next session.
      launched.on("disconnected", () => (browser = null));
      return launched;
    });
  browser.catch(() => (browser = null));
  return browser;
}

function authorized(req: IncomingMessage): boolean {
  const given = Buffer.from(String(req.headers["x-recorder-secret"] ?? ""));
  const want = Buffer.from(SECRET);
  return (
    SECRET.length > 0 &&
    given.length === want.length &&
    timingSafeEqual(given, want)
  );
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).byteLength;
    if (size > MAX_BODY_BYTES) throw new SessionError("Request too large.");
    chunks.push(chunk as Buffer);
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
}

function session(id: string): Session {
  const s = sessions.get(id);
  if (!s) throw new SessionError("No recording is running with that id.");
  return s;
}

async function route(
  method: string,
  path: string[],
  body: () => Promise<unknown>,
): Promise<unknown> {
  const [root, id, verb] = path;
  if (root !== "sessions" || !id) throw new SessionError("Not found.");
  if (method === "POST" && !verb) {
    if (sessions.has(id))
      throw new SessionError("That session already exists.");
    const { upload, ...rest } = (await body()) as Omit<
      StartRequest,
      "output"
    > & { upload: UploadCredentials };
    const s = await startSession(await getBrowser(), {
      ...rest,
      output: { kind: "upload", credentials: upload },
    });
    sessions.set(id, s);
    return { slug: s.slug, maxDurationMs: s.maxDurationMs };
  }
  if (method === "GET" && verb === "look") return session(id).look();
  if (method === "POST" && verb === "act") {
    await session(id).act((await body()) as Action);
    return { ok: true, elapsedSeconds: session(id).elapsedSeconds };
  }
  if (method === "POST" && verb === "narrate") {
    const { audio } = (await body()) as { audio: string };
    if (typeof audio !== "string" || !audio) {
      throw new SessionError("No audio to play.");
    }
    const pcm = await decodeAudio(Buffer.from(audio, "base64")).catch(() => {
      throw new SessionError("That audio couldn't be decoded.");
    });
    await session(id).play(pcm);
    return { ok: true, elapsedSeconds: session(id).elapsedSeconds };
  }
  if (method === "POST" && verb === "stop") {
    const result = await session(id).stop();
    sessions.delete(id);
    return result;
  }
  if (method === "DELETE" && !verb) {
    await session(id).cancel();
    sessions.delete(id);
    return { ok: true };
  }
  throw new SessionError("Not found.");
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://recorder");
  const send = (status: number, value: unknown) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(value));
  };
  if (url.pathname === "/ping") return send(200, { ok: true });
  if (!authorized(req)) return send(401, { error: "unauthorized" });
  try {
    const path = url.pathname.split("/").filter(Boolean);
    send(200, await route(req.method ?? "GET", path, () => readJson(req)));
  } catch (err) {
    if (err instanceof SessionError) return send(400, { error: err.message });
    console.error("[recorder]", err);
    send(500, { error: "The recorder failed. Try again." });
  }
}).listen(PORT, () => console.log(`[recorder] listening on ${PORT}`));

// The container is stopped with SIGTERM; Chromium has to go with it or it holds the port.
process.on("SIGTERM", () => {
  server.close();
  void (browser ?? Promise.resolve(null))
    .then((b) => b?.close())
    .catch(() => {})
    .finally(() => process.exit(0));
});
