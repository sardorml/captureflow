/// <reference types="@cloudflare/workers-types" />

import { agentAllowanceLeft, startOfMonthUtc } from "@captureflow/quota";
import type { AppWebBindings } from "../cf-env";
import { issueDeviceToken } from "../device-tokens";
import { getRecording } from "../recording/db";
import { initRecording, parseInitRequest } from "../recording/init";
import {
  countUserRecordingsInWorkspace,
  getWorkspaceEntitlement,
} from "../recording/quota";
import { SITE_URL, viewUrlFor } from "../site";
import {
  addNarratedChars,
  endAgentRecording,
  failPendingAgentRecording,
  findRunningAgentRecording,
  getAgentUsage,
  getRunningAgentRecording,
  IDLE_MS,
  insertAgentRecording,
  MAX_RECORDING_MS,
  SESSION_LIFETIME_MS,
  setAgentRecordingSlug,
} from "./agent-recordings-db";
import { LibraryError, resolveWorkspaceId, type McpUser } from "./library";

// A swarm demo is under a minute; a short cap gives its frames the plan's bytes at a high bitrate.
const DEMO_MAX_MS = 75_000;

// The cloud recorder makes presentations: slides and narration, no page to drive.
export type RecorderAction =
  | { type: "wait"; seconds: number }
  | { type: "show_slide"; slide: Slide };

export const SLIDE_LAYOUTS = [
  "cover",
  "list",
  "statement",
  "feature",
  "image",
  "code",
  "big_idea",
  "end_card",
] as const;
export const SLIDE_THEMES = ["white", "gray", "ink", "blue"] as const;

export type Slide = {
  layout?: (typeof SLIDE_LAYOUTS)[number];
  theme?: (typeof SLIDE_THEMES)[number];
  section?: string;
  page?: number;
  total?: number;
  tag?: string;
  title: string;
  subtitle?: string;
  items?: { text: string; tag?: string }[];
  facts?: { title: string; text?: string }[];
  from?: string;
  to?: string;
  imageUrl?: string;
  caption?: string;
  callout?: { x: number; y: number; w: number; h: number };
  code?: string;
  language?: string;
  lines?: string;
  highlight?: string;
  logo?: boolean;
  cta?: string;
};

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
    throw new LibraryError(
      "Recording isn't available on this server.",
      "unavailable",
    );
  }
  const json = (await res.json().catch(() => ({}))) as { error?: string };
  if (res.status === 400) {
    throw new LibraryError(json.error ?? "The recorder refused that.");
  }
  if (!res.ok) throw new Error(`recorder ${method} ${path}: ${res.status}`);
  return json as T;
}

async function allowanceLeft(db: D1Database, workspaceId: string) {
  const now = Date.now();
  const [entitlement, usage] = await Promise.all([
    getWorkspaceEntitlement(workspaceId),
    getAgentUsage(db, workspaceId, startOfMonthUtc(now), now),
  ]);
  const left = entitlement
    ? agentAllowanceLeft(entitlement, usage)
    : { agentMs: null, voiceoverChars: null };
  return { entitlement, left };
}

function newSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

type StartArgs = {
  title?: string;
  visibility?: "public" | "workspace" | "private";
  workspaceId?: string;
  quality?: "standard" | "high";
  // A shorter cap than the plan's leaves the clip more bytes per second.
  maxDurationMs?: number;
};

// Checks the user may record now, then opens the session's row and the body that starts its container.
async function prepareAgentRecording(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  args: StartArgs,
) {
  if (!env.RECORDER && !env.RECORDER_URL) {
    throw new LibraryError(
      "Recording isn't available on this server.",
      "unavailable",
    );
  }
  const now = Date.now();
  const [running, workspaceId] = await Promise.all([
    findRunningAgentRecording(db, user.userId, now - SESSION_LIFETIME_MS),
    resolveWorkspaceId(user, args.workspaceId),
  ]);
  if (running) {
    throw new LibraryError(
      `You already have a recording running (recording_id ${running.id}). Stop or cancel it first.`,
      "running",
    );
  }
  const { entitlement, left } = await allowanceLeft(db, workspaceId);
  if (left.agentMs !== null && left.agentMs < 60_000) {
    throw new LibraryError(
      "This workspace has used its agent recording minutes for this month. They reset on the 1st.",
      "limit",
    );
  }
  // The upload would be refused at the end otherwise, after the whole clip was made.
  const perPerson = entitlement?.recordingsPerPerson;
  if (
    perPerson != null &&
    (await countUserRecordingsInWorkspace(workspaceId, user.userId)) >=
      perPerson
  ) {
    throw new LibraryError(
      `Free plan limit: ${perPerson} recordings per person. Delete a recording or upgrade, then try again.`,
      "recordings",
    );
  }
  const maxDurationMs = Math.min(
    args.maxDurationMs ?? MAX_RECORDING_MS,
    MAX_RECORDING_MS,
    left.agentMs ?? Infinity,
  );

  const id = newSessionId();
  const token = await issueDeviceToken(user.userId, "Agent recording");
  await insertAgentRecording(db, {
    id,
    userId: user.userId,
    deviceTokenId: token.id,
    workspaceId,
    now,
  });
  const start = {
    title: args.title,
    visibility: args.visibility,
    workspaceId,
    quality: args.quality,
    maxDurationMs,
    idleMs: IDLE_MS,
    upload: {
      apiBase: `${SITE_URL}/api/r`,
      shareBase: SITE_URL,
      deviceId: `agent-${id}`,
      token: token.rawToken,
    },
  };
  return { id, start };
}

export async function startAgentRecording(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  args: StartArgs,
): Promise<{ recording_id: string; max_minutes: number }> {
  const { id, start } = await prepareAgentRecording(db, env, user, args);
  try {
    const started = await callRecorder<{ slug: string; maxDurationMs: number }>(
      env,
      id,
      "POST",
      "",
      start,
    );
    await setAgentRecordingSlug(db, id, started.slug);
    return {
      recording_id: id,
      max_minutes: Math.floor(started.maxDurationMs / 60_000),
    };
  } catch (err) {
    await endAgentRecording(db, id, Date.now());
    // Only a few cloud browsers run at once, so a start that fails is most often all of them busy.
    if (err instanceof LibraryError) throw err;
    throw new LibraryError(
      "Couldn't start a cloud browser; they may all be busy. Try again in a few minutes.",
      "busy",
    );
  }
}

/*
 * The swarm demo from the public page: the recorder runs the whole fixed
 * script on its own, so no agent drives it. The recording is made here and
 * handed to the recorder in the background, so the visitor is sent to its
 * page as soon as it exists; a start that fails marks it failed there. The
 * row is ended by the Durable Object once the clip is uploaded, or here in
 * local dev where the container is reached directly.
 */
export async function startSwarmDemo(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  url: string,
  background: (task: Promise<unknown>) => void,
): Promise<{ recording_id: string; url: string }> {
  const title = `${new URL(url).host} rebuilt by agents`;
  const { id, start } = await prepareAgentRecording(db, env, user, {
    title,
    quality: "high",
    maxDurationMs: DEMO_MAX_MS,
  });
  try {
    const parsed = parseInitRequest({
      contentType: "video/mp4",
      source: "instant",
      preset: "recording",
      client: "agent",
      hasWebcam: false,
      title,
      workspaceId: start.workspaceId,
    });
    if (parsed.kind === "error") throw new Error(parsed.error);
    const made = await initRecording(
      user.userId,
      start.upload.deviceId,
      parsed.init,
    );
    if (made.kind === "error") throw new LibraryError(made.error);
    const { slug } = made.response;
    await setAgentRecordingSlug(db, id, slug);
    background(
      callRecorder(env, id, "POST", "demo", {
        url,
        start: {
          ...start,
          upload: { ...start.upload, created: made.response },
        },
      }).then(
        () => (env.RECORDER_URL ? endAgentRecording(db, id, Date.now()) : null),
        async (err) => {
          console.warn("[swarm-demo] failed", err);
          await failPendingAgentRecording(db, id, errorText(err));
          await endAgentRecording(db, id, Date.now());
        },
      ),
    );
    return { recording_id: id, url: viewUrlFor(slug) };
  } catch (err) {
    await failPendingAgentRecording(db, id, errorText(err));
    await endAgentRecording(db, id, Date.now());
    throw err;
  }
}

function errorText(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
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

// Pro only, within the month's allowance: the voice is generated with Workers AI and mixed into the recording as it plays.
export async function narrate(
  db: D1Database,
  env: RecorderEnv,
  user: McpUser,
  id: string,
  text: string,
  voice: Voice,
): Promise<{ ok: true; elapsedSeconds: number }> {
  const row = await running(db, user, id);
  const workspaceId =
    row.workspaceId ??
    (row.slug ? (await getRecording(row.slug))?.workspaceId : null);
  const allowance = workspaceId ? await allowanceLeft(db, workspaceId) : null;
  if (!allowance?.entitlement?.ai) {
    throw new LibraryError(
      "Voiceover is a Pro feature. The recording keeps going without it.",
    );
  }
  const charsLeft = allowance.left.voiceoverChars;
  if (charsLeft !== null && text.length > charsLeft) {
    throw new LibraryError(
      "This workspace has used its voiceover minutes for this month. The recording keeps going without it.",
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
  await addNarratedChars(db, id, text.length);
  return callRecorder(env, id, "POST", "narrate", {
    audio: Buffer.from(audio).toString("base64"),
  });
}
