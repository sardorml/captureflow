/// <reference types="@cloudflare/workers-types" />

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withMcpAuth } from "better-auth/plugins";
import { z } from "zod";
import { getAuth } from "../auth";
import { getAppWebEnv, type AppWebBindings } from "../cf-env";
import { SORT_ORDERS } from "../list-filters";
import { resolveDeviceTokenToUser } from "../recording/device-tokens";
import { isValidSlug } from "../recording/slug";
import { R2_PUBLIC_BASE_URL } from "../site";
import {
  getRecordingDetails,
  getRecordingTranscript,
  LibraryError,
  listRecordings,
  listWorkspaces,
  loadMcpUser,
  searchRecordings,
  setRecordingVisibility,
  type McpUser,
} from "./library";
import {
  actOnPage,
  cancelAgentRecording,
  lookAtPage,
  narrate,
  startAgentRecording,
  stopAgentRecording,
  type RecorderAction,
  SLIDE_LAYOUTS,
  SLIDE_THEMES,
  VOICES,
} from "./recording";

const recordingId = z
  .string()
  .refine(isValidSlug, "Not a recording id")
  .describe("The recording's id, the last part of its share link.");

function result(value: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
    structuredContent:
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : { items: value },
  };
}

const sessionId = z
  .string()
  .regex(/^[0-9a-f]{32}$/, "Not a recording_id")
  .describe("The recording_id start_recording returned.");

// A LibraryError is meant for the agent; anything else stays in the logs.
async function run(
  work: () => Promise<unknown>,
  toResult: (value: unknown) => CallToolResult = result,
): Promise<CallToolResult> {
  try {
    return toResult(await work());
  } catch (err) {
    if (!(err instanceof LibraryError)) console.error("[mcp] tool failed", err);
    return {
      isError: true,
      content: [
        {
          type: "text",
          text:
            err instanceof LibraryError
              ? err.message
              : "Something went wrong on CaptureFlow's side. Try again.",
        },
      ],
    };
  }
}

// Shown to the agent on connect: the defaults it follows when the user doesn't say.
const INSTRUCTIONS = `CaptureFlow makes presentation, how-to and walkthrough videos that people share as a link, and keeps the user's library of recordings. You build a video from slides and narration, from what the user tells or gives you.

When you make a video:
- The user's words always win. "No voice", "just three slides" or "no end card" override everything below.
- Plan the whole deck before start_presentation: one idea per slide, in the order a viewer needs them, and stop as soon as the last slide has been seen.
- Open with a cover slide. A how-to lists its steps on a list slide, then gives each step its own slide: an image slide with the user's screenshot and a callout on what to click, or a feature or statement slide when there is no picture. Code goes on a code slide with the lines that matter highlighted. Close with an end_card or statement that says what the viewer can do now.
- Keep text short: a headline of a few words, a subtitle of one sentence. The slide is what the viewer reads, the narration is what they hear.
- Narrate only when the user asks for a voice or voiceover. Then narrate every slide, a sentence or two per call, right after showing it. Without narration, wait 3 to 5 seconds on each slide so it can be read.
- Only images at public http(s) addresses can be shown. Ask the user for a link when a screenshot isn't one.
- Give the user the share link from stop_recording.`;

function lookResult(value: unknown): CallToolResult {
  const { image, ...page } = value as { image: string };
  return {
    content: [
      { type: "image", data: image, mimeType: "image/jpeg" },
      { type: "text", text: JSON.stringify(page, null, 2) },
    ],
  };
}

const ANNOTATIONS = {
  readsLibrary: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: false,
  },
  readsPage: {
    readOnlyHint: true,
    destructiveHint: false,
    openWorldHint: true,
  },
  changesLibrary: {
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: false,
  },
  removesAccess: {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
    idempotentHint: true,
  },
  discardsRecording: {
    readOnlyHint: false,
    destructiveHint: true,
    openWorldHint: false,
  },
  // A slide can fetch an image from anywhere on the web.
  opensPage: {
    readOnlyHint: false,
    destructiveHint: false,
    openWorldHint: true,
  },
} as const;

export function createServer(
  db: D1Database,
  env: AppWebBindings,
  user: McpUser,
  cdnBase: string,
): McpServer {
  const server = new McpServer(
    { name: "CaptureFlow", version: "1.0.0" },
    { instructions: INSTRUCTIONS },
  );

  server.registerTool(
    "list_workspaces",
    {
      title: "List workspaces",
      description: "The workspaces you belong to, with your role in each.",
      annotations: ANNOTATIONS.readsLibrary,
    },
    () => run(async () => ({ workspaces: listWorkspaces(user) })),
  );

  server.registerTool(
    "list_recordings",
    {
      title: "List recordings",
      description:
        "Recordings in a workspace you can see, 20 per page. Defaults to your current workspace, newest first.",
      inputSchema: {
        workspace_id: z.string().optional(),
        page: z.number().int().min(1).optional(),
        sort: z.enum(SORT_ORDERS).optional(),
      },
      annotations: ANNOTATIONS.readsLibrary,
    },
    ({ workspace_id, page, sort }) =>
      run(() =>
        listRecordings(user, { workspaceId: workspace_id, page, sort }),
      ),
  );

  server.registerTool(
    "search_recordings",
    {
      title: "Search recordings",
      description: "Your own recordings whose title contains the query.",
      inputSchema: { query: z.string().min(2).max(200) },
      annotations: ANNOTATIONS.readsLibrary,
    },
    ({ query }) =>
      run(async () => ({
        hits: await searchRecordings(db, user, query, cdnBase),
      })),
  );

  server.registerTool(
    "get_recording",
    {
      title: "Get a recording",
      description:
        "A recording's share link, length, visibility, AI summary and chapters.",
      inputSchema: { id: recordingId },
      annotations: ANNOTATIONS.readsLibrary,
    },
    ({ id }) => run(() => getRecordingDetails(user, id)),
  );

  server.registerTool(
    "get_transcript",
    {
      title: "Get a transcript",
      description:
        "What is said in a recording, as timestamped text or WebVTT captions. Parts the owner cut are left out.",
      inputSchema: {
        id: recordingId,
        format: z.enum(["text", "vtt"]).optional(),
      },
      annotations: ANNOTATIONS.readsLibrary,
    },
    ({ id, format }) =>
      run(() => getRecordingTranscript(user, id, format ?? "text")),
  );

  server.registerTool(
    "set_visibility",
    {
      title: "Set who can watch",
      description:
        "public: anyone with the link. workspace: members of its workspace. private: only the person who recorded it.",
      inputSchema: {
        id: recordingId,
        visibility: z.enum(["public", "workspace", "private"]),
      },
      annotations: ANNOTATIONS.removesAccess,
    },
    ({ id, visibility }) =>
      run(() => setRecordingVisibility(user, id, visibility)),
  );

  const act = (recording_id: string, action: RecorderAction) =>
    run(() => actOnPage(db, env, user, recording_id, action));

  server.registerTool(
    "start_presentation",
    {
      title: "Start a presentation",
      description:
        "Starts a new video that is built from slides: a presentation, a how-to or a walkthrough. " +
        "Then call show_slide for each slide in turn, narrate over each one if asked for a voiceover or wait a few seconds on it otherwise, " +
        "call look to check how a slide came out, and call stop_recording for the share link. " +
        "Only slides, waits and narration are recorded, not the time between calls. " +
        "Plan the whole deck first, and stop as soon as the last slide has been seen. " +
        "A video ends on its own after 2 minutes without a call or at its length limit.",
      inputSchema: {
        title: z.string().max(200).optional(),
        visibility: z.enum(["public", "workspace", "private"]).optional(),
        workspace_id: z.string().optional(),
      },
      annotations: ANNOTATIONS.changesLibrary,
    },
    ({ title, visibility, workspace_id }) =>
      run(() =>
        startAgentRecording(db, env, user, {
          title,
          visibility,
          workspaceId: workspace_id,
        }),
      ),
  );

  server.registerTool(
    "look",
    {
      title: "Look at the video",
      description:
        "A screenshot of what the video shows right now, to check a slide came out as meant. Not recorded.",
      inputSchema: { recording_id: sessionId },
      annotations: ANNOTATIONS.readsPage,
    },
    ({ recording_id }) =>
      run(() => lookAtPage(db, env, user, recording_id), lookResult),
  );

  server.registerTool(
    "wait",
    {
      title: "Wait",
      description:
        "Holds on the current slide so a viewer can read it, up to 10 seconds.",
      inputSchema: {
        recording_id: sessionId,
        seconds: z.number().min(0.5).max(10),
      },
      annotations: ANNOTATIONS.changesLibrary,
    },
    ({ recording_id, seconds }) => act(recording_id, { type: "wait", seconds }),
  );

  server.registerTool(
    "show_slide",
    {
      title: "Show a slide",
      description:
        "Cuts the video to the next full-screen slide, which stays up until the next one. Pick a layout: " +
        "cover (opening title + subtitle), list (title + numbered items, for steps or contents), " +
        "statement (one big sentence + subtitle), feature (tag + title + subtitle, with up to 3 facts or an image beside the text), " +
        "image (a screenshot framed under a short title, with an optional caption and a callout ring on the part that matters), " +
        "code (a code block under a short title, with the lines that matter highlighted), " +
        "big_idea (a few huge words + a from/to caption), end_card (closing line with a button, for the last slide). " +
        "Keep text short: a headline of a few words, a subtitle of one sentence. " +
        "Use section and page/total for a running top bar across a deck. Each slide becomes a chapter.",
      inputSchema: {
        recording_id: sessionId,
        layout: z
          .enum(SLIDE_LAYOUTS)
          .optional()
          .describe("Defaults to feature."),
        title: z.string().min(1).max(140),
        subtitle: z.string().max(240).optional(),
        tag: z
          .string()
          .max(24)
          .optional()
          .describe("A short pill above a feature's title, like 'New'."),
        items: z
          .array(
            z.object({
              text: z.string().min(1).max(80),
              tag: z.string().max(24).optional(),
            }),
          )
          .max(6)
          .optional()
          .describe("For list: numbered rows."),
        facts: z
          .array(
            z.object({
              title: z.string().min(1).max(40),
              text: z.string().max(90).optional(),
            }),
          )
          .max(3)
          .optional()
          .describe("For feature: up to 3 short facts along the bottom."),
        from: z
          .string()
          .max(40)
          .optional()
          .describe(
            "For big_idea: the caption's start, like 'From a meeting'.",
          ),
        to: z
          .string()
          .max(40)
          .optional()
          .describe("For big_idea: the caption's end, like 'to a link'."),
        image_url: z
          .string()
          .url()
          .max(2000)
          .optional()
          .describe(
            "For image and feature: a public http(s) image, such as the user's screenshot.",
          ),
        caption: z
          .string()
          .max(160)
          .optional()
          .describe("For image: one line under the picture."),
        callout: z
          .object({
            x: z.number().min(0).max(100),
            y: z.number().min(0).max(100),
            w: z.number().min(1).max(100),
            h: z.number().min(1).max(100),
          })
          .optional()
          .describe(
            "For image: the part to ring, as percentages of the picture's width and height from its top left.",
          ),
        code: z
          .string()
          .max(2000)
          .optional()
          .describe("For code: up to 18 lines of 90 columns."),
        language: z
          .string()
          .max(24)
          .optional()
          .describe("For code: the label on the block, like 'ts'."),
        lines: z
          .string()
          .max(60)
          .optional()
          .describe("For code: the lines to highlight, like '3-5, 8'."),
        section: z
          .string()
          .max(40)
          .optional()
          .describe("Top bar, left: the deck section."),
        page: z.number().int().min(1).max(99).optional(),
        total: z.number().int().min(1).max(99).optional(),
        theme: z
          .enum(SLIDE_THEMES)
          .optional()
          .describe("Overrides the layout's colour."),
        highlight: z
          .string()
          .max(60)
          .optional()
          .describe("Words of the title to circle with a hand-drawn line."),
        logo: z
          .boolean()
          .optional()
          .describe(
            "Shows the CaptureFlow logo on cover and end_card. Leave it off when the demo is of another product.",
          ),
        cta: z
          .string()
          .max(60)
          .optional()
          .describe("For end_card: the button's text."),
      },
      annotations: ANNOTATIONS.opensPage,
    },
    ({ recording_id, image_url, ...slide }) =>
      act(recording_id, {
        type: "show_slide",
        slide: { ...slide, imageUrl: image_url },
      }),
  );

  server.registerTool(
    "narrate",
    {
      title: "Say something",
      description:
        "Speaks the text as a voiceover in the video and returns once it has been said. " +
        "Narrate the slide that is up, a sentence or two per call. Pro plans only.",
      inputSchema: {
        recording_id: sessionId,
        text: z.string().min(1).max(600),
        voice: z.enum(VOICES).optional().describe("Defaults to luna."),
      },
      annotations: ANNOTATIONS.changesLibrary,
    },
    ({ recording_id, text, voice }) =>
      run(() => narrate(db, env, user, recording_id, text, voice ?? "luna")),
  );

  server.registerTool(
    "stop_recording",
    {
      title: "Stop and get the link",
      description:
        "Ends the video and returns its share link. Give the link to the user.",
      inputSchema: { recording_id: sessionId },
      annotations: ANNOTATIONS.changesLibrary,
    },
    ({ recording_id }) =>
      run(() => stopAgentRecording(db, env, user, recording_id)),
  );

  server.registerTool(
    "cancel_recording",
    {
      title: "Cancel the video",
      description: "Ends the video and throws it away.",
      inputSchema: { recording_id: sessionId },
      annotations: ANNOTATIONS.discardsRecording,
    },
    ({ recording_id }) =>
      run(() => cancelAgentRecording(db, env, user, recording_id)),
  );

  return server;
}

async function serve(request: Request, userId: string): Promise<Response> {
  const env = await getAppWebEnv();
  if (!env?.DB) {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
  const user = await loadMcpUser(env.DB, userId);
  const server = createServer(
    env.DB,
    env,
    user,
    env.R2_PUBLIC_BASE_URL ?? R2_PUBLIC_BASE_URL,
  );
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  return transport.handleRequest(request);
}

function extractBearerToken(req: Request): string | null {
  const h = req.headers.get("authorization") ?? "";
  const m = /^bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1]!.trim() : null;
}

/*
 * Stateless: every request builds its server for the token's user and
 * answers in JSON, so no session outlives the request and bindings are
 * resolved per call. The local MCP signs in with a device token instead of
 * OAuth, and reaches the library tools through here.
 */
export async function handleMcpRequest(req: Request): Promise<Response> {
  const bearer = extractBearerToken(req);
  const deviceUserId = bearer ? await resolveDeviceTokenToUser(bearer) : null;
  if (deviceUserId) return serve(req, deviceUserId);
  const auth = await getAuth();
  return withMcpAuth(auth, async (request, session) =>
    session.userId
      ? serve(request, session.userId)
      : Response.json({ error: "unavailable" }, { status: 503 }),
  )(req);
}
