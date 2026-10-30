/// <reference types="@cloudflare/workers-types" />

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { withMcpAuth } from "better-auth/plugins";
import { z } from "zod";
import { getAuth } from "../auth";
import { getAppWebEnv, type AppWebBindings } from "../cf-env";
import { SORT_ORDERS } from "../list-filters";
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

const target = z
  .object({
    text: z
      .string()
      .min(1)
      .max(200)
      .optional()
      .describe("The visible text or accessible name of the element."),
    selector: z
      .string()
      .min(1)
      .max(500)
      .optional()
      .describe("A CSS selector, when the text is ambiguous."),
  })
  .refine((t) => t.text || t.selector, "Give text or selector.");

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
const INSTRUCTIONS = `CaptureFlow records screen videos people share as a link. You can read the user's library and record a cloud browser for them.

When you record:
- The user's words always win. "No slides", "only an intro" or "no voice" override everything below.
- Tutorials, demos, walkthroughs, onboarding and feature presentations: open with a slide (cover for a title, list for the steps), and end with a closing slide (statement or big_idea) that says what the viewer can do now. Before each major part of the demo, a short feature slide helps when there's more than one part.
- A plain "record this page" or a quick capture: no slides.
- Keep slides to a few seconds each and never let them outweigh the screen time. Short headline, one-sentence subtitle.
- Plan the walkthrough before start_recording, move at a pace a viewer can follow, and stop as soon as it's done.
- Narrate only when the user asks for a voice or voiceover. Then narrate every slide and every step, a sentence or two at a time.
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

function createServer(
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
      annotations: { readOnlyHint: true },
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
      annotations: { readOnlyHint: true },
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
      annotations: { readOnlyHint: true },
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
      annotations: { readOnlyHint: true },
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
      annotations: { readOnlyHint: true },
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
      annotations: { idempotentHint: true },
    },
    ({ id, visibility }) =>
      run(() => setRecordingVisibility(user, id, visibility)),
  );

  const act = (recording_id: string, action: RecorderAction) =>
    run(() => actOnPage(db, env, user, recording_id, action));

  server.registerTool(
    "start_recording",
    {
      title: "Start a recording",
      description:
        "Opens the page in a cloud browser and starts recording it, with a visible cursor. " +
        "Then call look to see the page, drive it with click, type, press, scroll, navigate and wait, " +
        "put up show_slide for title or feature slides, " +
        "narrate over it if asked for a voiceover, " +
        "and call stop_recording for the share link. Only the actions and narration are recorded, not the time between calls. " +
        "Plan the walkthrough, move at a pace a viewer can follow, and stop as soon as it's done. " +
        "A recording ends on its own after 2 minutes without an action or at its length limit.",
      inputSchema: {
        url: z.string().url().max(2000),
        title: z.string().max(200).optional(),
        visibility: z.enum(["public", "workspace", "private"]).optional(),
        workspace_id: z.string().optional(),
      },
    },
    ({ url, title, visibility, workspace_id }) =>
      run(() =>
        startAgentRecording(db, env, user, {
          url,
          title,
          visibility,
          workspaceId: workspace_id,
        }),
      ),
  );

  server.registerTool(
    "look",
    {
      title: "Look at the page",
      description:
        "A screenshot of what the recording shows right now, plus the page's URL, title and accessibility outline. " +
        "Use the outline's names as click targets.",
      inputSchema: { recording_id: sessionId },
      annotations: { readOnlyHint: true },
    },
    ({ recording_id }) =>
      run(() => lookAtPage(db, env, user, recording_id), lookResult),
  );

  server.registerTool(
    "click",
    {
      title: "Click",
      description: "Moves the cursor to an element and clicks it.",
      inputSchema: { recording_id: sessionId, target },
    },
    ({ recording_id, target }) => act(recording_id, { type: "click", target }),
  );

  server.registerTool(
    "type",
    {
      title: "Type",
      description:
        "Types text at a readable speed, into the target field if given, else wherever focus is. submit presses Enter after.",
      inputSchema: {
        recording_id: sessionId,
        text: z.string().min(1).max(2000),
        target: target.optional(),
        submit: z.boolean().optional(),
      },
    },
    ({ recording_id, text, target, submit }) =>
      act(recording_id, { type: "type", text, target, submit }),
  );

  server.registerTool(
    "press",
    {
      title: "Press a key",
      description: "Presses a key or chord, like Enter, Escape, Tab or Meta+K.",
      inputSchema: { recording_id: sessionId, key: z.string().min(1).max(40) },
    },
    ({ recording_id, key }) => act(recording_id, { type: "press", key }),
  );

  server.registerTool(
    "scroll",
    {
      title: "Scroll",
      description:
        "Scrolls the page smoothly. amount is in screen heights, 0.8 by default.",
      inputSchema: {
        recording_id: sessionId,
        direction: z.enum(["down", "up"]),
        amount: z.number().min(0.1).max(5).optional(),
      },
    },
    ({ recording_id, direction, amount }) =>
      act(recording_id, { type: "scroll", direction, amount }),
  );

  server.registerTool(
    "navigate",
    {
      title: "Go to a page",
      description: "Loads another address in the recorded browser.",
      inputSchema: { recording_id: sessionId, url: z.string().url().max(2000) },
    },
    ({ recording_id, url }) => act(recording_id, { type: "navigate", url }),
  );

  server.registerTool(
    "wait",
    {
      title: "Wait",
      description:
        "Holds on the current view so a viewer can take it in, up to 10 seconds.",
      inputSchema: {
        recording_id: sessionId,
        seconds: z.number().min(0.5).max(10),
      },
    },
    ({ recording_id, seconds }) => act(recording_id, { type: "wait", seconds }),
  );

  server.registerTool(
    "show_slide",
    {
      title: "Show a slide",
      description:
        "Cuts the recording to a full-screen slide; call hide_slide to cut back to the page. Pick a layout: " +
        "cover (opening title + subtitle), list (title + numbered items, for steps or contents), " +
        "statement (one big sentence + subtitle), feature (tag + title + subtitle, with up to 3 facts or an image), " +
        "big_idea (a few huge words + a from/to caption). " +
        "Keep text short: a headline of a few words, a subtitle of one sentence. " +
        "Use section and page/total for a running top bar across a deck. " +
        "Narrate over a slide if you like; clicks and typing while it's up happen unseen on the page underneath.",
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
            "For feature: a public http(s) image shown beside the text.",
          ),
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
      },
    },
    ({ recording_id, image_url, ...slide }) =>
      act(recording_id, {
        type: "show_slide",
        slide: { ...slide, imageUrl: image_url },
      }),
  );

  server.registerTool(
    "hide_slide",
    {
      title: "Hide the slide",
      description: "Cuts back from the slide to the page.",
      inputSchema: { recording_id: sessionId },
    },
    ({ recording_id }) => act(recording_id, { type: "hide_slide" }),
  );

  server.registerTool(
    "narrate",
    {
      title: "Say something",
      description:
        "Speaks the text as a voiceover in the recording and returns once it has been said. " +
        "Narrate what the viewer is looking at, a sentence or two per call, then act. Pro plans only.",
      inputSchema: {
        recording_id: sessionId,
        text: z.string().min(1).max(600),
        voice: z.enum(VOICES).optional().describe("Defaults to luna."),
      },
    },
    ({ recording_id, text, voice }) =>
      run(() => narrate(db, env, user, recording_id, text, voice ?? "luna")),
  );

  server.registerTool(
    "stop_recording",
    {
      title: "Stop and get the link",
      description:
        "Ends the recording and returns its share link. Give the link to the user.",
      inputSchema: { recording_id: sessionId },
    },
    ({ recording_id }) =>
      run(() => stopAgentRecording(db, env, user, recording_id)),
  );

  server.registerTool(
    "cancel_recording",
    {
      title: "Cancel a recording",
      description: "Ends the recording and throws it away.",
      inputSchema: { recording_id: sessionId },
      annotations: { destructiveHint: true },
    },
    ({ recording_id }) =>
      run(() => cancelAgentRecording(db, env, user, recording_id)),
  );

  return server;
}

/*
 * Stateless: every request builds its server for the token's user and
 * answers in JSON, so no session outlives the request and bindings are
 * resolved per call.
 */
export async function handleMcpRequest(req: Request): Promise<Response> {
  const auth = await getAuth();
  return withMcpAuth(auth, async (request, session) => {
    const env = await getAppWebEnv();
    if (!env?.DB || !session.userId) {
      return Response.json({ error: "unavailable" }, { status: 503 });
    }
    const user = await loadMcpUser(env.DB, session.userId);
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
  })(req);
}
