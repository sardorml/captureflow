/// <reference types="@cloudflare/workers-types" />

import type { AppWebBindings } from "../cf-env";
import { issueDeviceToken } from "../device-tokens";
import { getRecording } from "../recording/db";
import { getWorkspaceEntitlement } from "../recording/quota";
import { SITE_URL, viewUrlFor } from "../site";
import {
  endAgentRecording,
  findRunningAgentRecording,
  getRunningAgentRecording,
  IDLE_MS,
  insertAgentRecording,
  MAX_RECORDING_MS,
  SESSION_LIFETIME_MS,
  setAgentRecordingSlug,
} from "./agent-recordings-db";
import { LibraryError, resolveWorkspaceId, type McpUser } from "./library";

export type Target = { text?: string; selector?: string };

export type RecorderAction =
  | { type: "click"; target: Target }
  | { type: "type"; text: string; target?: Target; submit?: boolean }
  | { type: "press"; key: string }
  | { type: "scroll"; direction: "down" | "up"; amount?: number }
  | { type: "navigate"; url: string }
  | { type: "wait"; seconds: number };

export type PageLook = {
  url: string;
  title: string;
  image: string;
  outline: string;
};

type RecorderEnv = Pick<
  AppWebBindings,
  "RECORDER" | "RECORDER_URL" | "RECORDER_SECRET" | "AI"
>;

export const VOICES = [
  "luna",
  "asteria",
  "athena",
  "aurora",
  "hera",
  "thalia",
  "apollo",
  "arcas",
  "orion",
  "orpheus",
  "zeus",
] as const;
export type Voice = (typeof VOICES)[number];
const TTS_MODEL = "@cf/deepgram/aura-2-en";

/*
 * Each session gets its own container, addressed by the session id. Local dev
 * has no containers (its RECORDER binding can't start one), so RECORDER_URL,
 * when set, points at `pnpm --filter @captureflow/recorder dev` instead.
 */
async function callRecorder<T>(
  env: RecorderEnv,
  sessionId: string,
  method: "GET" | "POST" | "DELETE",
  verb: string,
  body?: unknown,
): Promise<T> {
  const path = `/sessions/${sessionId}${verb ? `/${verb}` : ""}`;
  const init: RequestInit = {
    method,
    headers: {
      "content-type": "application/json",
      "x-recorder-secret": env.RECORDER_SECRET ?? "",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
  let res: Response;
  if (env.RECORDER_URL) {
    res = await fetch(`${env.RECORDER_URL}${path}`, init);
  } else if (env.RECORDER) {
    const stub = env.RECORDER.get(env.RECORDER.idFromName(sessionId));
    res = await stub.fetch(new Request(`http://recorder${path}`, init));
  } else {
    throw new LibraryError("Recording isn't available on this server.");
  }
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 400) {
    throw new LibraryError(json.error ?? "The recorder refused that.");
  }
  if (!res.ok) throw new Error(`recorder ${method} ${path}: ${res.status}`);
  return json as T;
}

function newSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function startAgentRecording(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  args: {
    url: string;
    title?: string;
    visibility?: "public" | "workspace" | "private";
    workspaceId?: string;
  },
): Promise<{ recording_id: string; max_minutes: number }> {
  if (!env.RECORDER && !env.RECORDER_URL) {
    throw new LibraryError("Recording isn't available on this server.");
  }
  const now = Date.now();
  const running = await findRunningAgentRecording(
    db,
    user.userId,
    now - SESSION_LIFETIME_MS,
  );
  if (running) {
    throw new LibraryError(
      `You already have a recording running (recording_id ${running.id}). Stop or cancel it first.`,
    );
  }
  const workspaceId = args.workspaceId
    ? await resolveWorkspaceId(user, args.workspaceId)
    : undefined;

  const id = newSessionId();
  const token = await issueDeviceToken(user.userId, "Agent recording");
  await insertAgentRecording(db, {
    id,
    userId: user.userId,
    deviceTokenId: token.id,
    now,
  });
  try {
    const started = await callRecorder<{ slug: string; maxDurationMs: number }>(
      env,
      id,
      "POST",
      "",
      {
        url: args.url,
        title: args.title,
        visibility: args.visibility,
        workspaceId,
        maxDurationMs: MAX_RECORDING_MS,
        idleMs: IDLE_MS,
        upload: {
          apiBase: `${SITE_URL}/api/r`,
          shareBase: SITE_URL,
          deviceId: `agent-${id}`,
          token: token.rawToken,
        },
      },
    );
    await setAgentRecordingSlug(db, id, started.slug);
    return {
      recording_id: id,
      max_minutes: Math.floor(started.maxDurationMs / 60_000),
    };
  } catch (err) {
    await endAgentRecording(db, id, Date.now());
    throw err;
  }
}

async function running(db: D1Database, user: McpUser, id: string) {
  const row = await getRunningAgentRecording(db, user.userId, id);
  if (!row) {
    throw new LibraryError("No recording of yours is running with that id.");
  }
  return row;
}

export async function lookAtPage(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
): Promise<PageLook> {
  await running(db, user, id);
  return callRecorder<PageLook>(env, id, "GET", "look");
}

export async function actOnPage(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
  action: RecorderAction,
): Promise<{ ok: true; elapsedSeconds: number }> {
  await running(db, user, id);
  return callRecorder(env, id, "POST", "act", action);
}

export async function stopAgentRecording(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
): Promise<{ url: string; durationSeconds: number | null }> {
  const row = await running(db, user, id);
  try {
    return await callRecorder(env, id, "POST", "stop");
  } catch (err) {
    // The container is gone, but what it uploaded before is still the recording.
    if (err instanceof LibraryError && row.slug) {
      return { url: viewUrlFor(row.slug), durationSeconds: null };
    }
    throw err;
  } finally {
    await endAgentRecording(db, id, Date.now());
  }
}

export async function cancelAgentRecording(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
): Promise<{ cancelled: true }> {
  await running(db, user, id);
  try {
    await callRecorder(env, id, "DELETE", "");
  } finally {
    await endAgentRecording(db, id, Date.now());
  }
  return { cancelled: true };
}

// Pro only: the voice is generated with Workers AI and mixed into the recording as it plays.
export async function narrate(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
  text: string,
  voice: Voice,
): Promise<{ ok: true; elapsedSeconds: number }> {
  const row = await running(db, user, id);
  const recording = row.slug ? await getRecording(row.slug) : null;
  const entitlement = recording?.workspaceId
    ? await getWorkspaceEntitlement(recording.workspaceId)
    : null;
  if (!entitlement?.ai) {
    throw new LibraryError(
      "Voiceover is a Pro feature. The recording keeps going without it.",
    );
  }
  if (!env.AI) throw new LibraryError("Voiceover isn't available here.");
  const speech = await env.AI.run(
    TTS_MODEL as keyof AiModels,
    {
      text,
      speaker: voice,
      encoding: "mp3",
    } as never,
  );
  const audio = new Uint8Array(
    await new Response(speech as unknown as BodyInit).arrayBuffer(),
  );
  return callRecorder(env, id, "POST", "narrate", {
    audio: Buffer.from(audio).toString("base64"),
  });
}
