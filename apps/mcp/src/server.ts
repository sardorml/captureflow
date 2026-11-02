import { randomBytes } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { chromium, type Browser } from "playwright";
import { z } from "zod";
import {
  SessionError,
  startSession,
  type Action,
  type Chapter,
  type RecordingOutput,
  type Session,
} from "@captureflow/agent-recorder";
import { loadCredentials, type Credentials, type Settings } from "./config";
import { createLibrary } from "./library";
import { startLogin } from "./login";
import { formatAt, putReport, reportMarkdown, slugFromLink } from "./report";
import { resolveFfmpeg } from "./runtime";
import {
  displayFor,
  findWindow,
  listScreens,
  type ScreenTarget,
} from "./screen";
import { startScreenSession, type ScreenSession } from "./screen-session";
import { KOKORO_VOICES, speak, warmVoice } from "./voice";

export const VERSION = "0.1.0";

const MAX_RECORDING_MS = 30 * 60_000;
const IDLE_MS = 5 * 60_000;
const SLIDE_LAYOUTS = [
  "cover",
  "list",
  "statement",
  "feature",
  "big_idea",
] as const;
const SLIDE_THEMES = ["navy", "blue", "cream"] as const;

class ToolError extends Error {}

type Live =
  | { kind: "browser"; session: Session; browser: Browser; title: string }
  | { kind: "screen"; session: ScreenSession; browser: Browser; title: string };

type Finished = { title: string; video: string; chapters: Chapter[] };

const INSTRUCTIONS = `CaptureFlow records screen videos people share as a link. This server runs on the user's own computer: it records a browser that can open localhost and the local network, or the user's screen or one app's window, and narrates with a voice that runs locally.

Pick what to record:
- A web app, including one on localhost: start_recording with its URL. You drive it with click, type, scroll and navigate.
- Anything else on the computer (a terminal, a desktop app, the whole screen): list_screens, then start_screen_recording. It films what happens; do the work with your own tools while it runs.

When you record:
- The user's words always win. "No slides", "only an intro" or "no voice" override everything below.
- Tutorials, demos, walkthroughs, onboarding and feature presentations: open with a slide (cover for a title, list for the steps), and end with a closing slide (statement or big_idea) that says what the viewer can do now. Before each major part of the demo, a short feature slide helps when there's more than one part.
- A plain "record this" or a quick capture: no slides.
- Keep slides to a few seconds each and never let them outweigh the screen time. Short headline, one-sentence subtitle.
- Plan the walkthrough before you start, move at a pace a viewer can follow, and stop as soon as it's done.
- Narrate only when the user asks for a voice or voiceover. Then narrate every slide and every step, a sentence or two at a time, and pass voiceover: true when you start so the voice is ready.
- When the recording shows work you did (a fix, a feature, a test run), call create_report after stop_recording with a plain-text summary of what changed, what you checked and anything that failed.
- Give the user the link from stop_recording.`;

const recordingId = z
  .string()
  .regex(/^[0-9a-f]{32}$/, "Not a recording_id")
  .describe("The recording_id the start tool returned.");
const visibility = z
  .enum(["public", "workspace", "private"])
  .optional()
  .describe("Who can open the link. Defaults to the workspace's setting.");
const workspaceId = z
  .string()
  .max(64)
  .optional()
  .describe(
    "Which workspace it goes to; list_workspaces lists them. Defaults to the user's current one.",
  );
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

function json(value: unknown): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function failure(message: string): CallToolResult {
  return { isError: true, content: [{ type: "text", text: message }] };
}

type LocalTool = {
  name: string;
  title: string;
  description: string;
  input: z.ZodObject;
  destructive?: boolean;
  run(args: never): Promise<CallToolResult>;
};

function tool<S extends z.ZodRawShape>(
  name: string,
  title: string,
  description: string,
  shape: S,
  run: (args: z.infer<z.ZodObject<S>>) => Promise<CallToolResult>,
  destructive = false,
): LocalTool {
  return {
    name,
    title,
    description,
    input: z.object(shape),
    destructive,
    run: run as LocalTool["run"],
  };
}

export function createLocalServer(settings: Settings) {
  const live = new Map<string, Live>();
  const finished = new Map<string, Finished>();
  const library = createLibrary(settings.url, VERSION);
  let login: Promise<unknown> | null = null;

  const server = new Server(
    { name: "CaptureFlow (local)", version: VERSION },
    {
      capabilities: { tools: { listChanged: true } },
      instructions: INSTRUCTIONS,
    },
  );

  async function credentials(): Promise<Credentials | null> {
    return loadCredentials(settings.url);
  }

  // Signing in needs the user in a browser, so the call that finds no sign-in starts it and asks the agent to come back.
  async function requireCredentials(): Promise<Credentials> {
    const creds = await credentials();
    if (creds) return creds;
    if (!login) {
      const pending = await startLogin(settings.url);
      login = pending.done
        .then(() => {
          library.reset();
          return server.sendToolListChanged();
        })
        .catch(() => {})
        .finally(() => (login = null));
      throw new ToolError(
        `CaptureFlow needs the user to sign in once. A browser tab opened at ${pending.url}; ask them to sign in there, then try again. (Or they can run \`npx @captureflow/mcp login\` in a terminal.)`,
      );
    }
    throw new ToolError(
      "Still waiting for the user to finish signing in to CaptureFlow in their browser. Try again once they have.",
    );
  }

  async function output(
    captureSource: "tab" | "window" | "screen",
    title: string,
  ): Promise<RecordingOutput> {
    if (settings.saveDir) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const name =
        title
          .replace(/[^\w-]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 60) || "recording";
      return {
        kind: "file",
        path: join(settings.saveDir, `${stamp}-${name}.mp4`),
      };
    }
    const creds = await requireCredentials();
    return {
      kind: "upload",
      captureSource,
      credentials: {
        apiBase: `${settings.url}/api/r`,
        shareBase: settings.url,
        deviceId: creds.deviceId,
        token: creds.token,
      },
    };
  }

  function guardOne() {
    const running = [...live.keys()][0];
    if (running) {
      throw new ToolError(
        `A recording is already running (recording_id ${running}). Stop or cancel it first.`,
      );
    }
  }

  function get(id: string): Live {
    const entry = live.get(id);
    if (!entry) throw new ToolError("No recording is running with that id.");
    return entry;
  }

  async function launch(headless: boolean): Promise<Browser> {
    const args = ["--autoplay-policy=no-user-gesture-required"];
    try {
      return await chromium.launch({ channel: "chrome", headless, args });
    } catch {
      try {
        return await chromium.launch({ headless, args });
      } catch {
        throw new ToolError(
          "Couldn't start a browser. Install Google Chrome, or run `npx playwright install chromium` once.",
        );
      }
    }
  }

  async function end(id: string, how: "stop" | "cancel") {
    const entry = get(id);
    try {
      if (how === "cancel") {
        await entry.session.cancel();
        return null;
      }
      const chapters = [...entry.session.chapters];
      const result = await entry.session.stop();
      const key = entry.session.slug ?? fileURLToPath(result.url);
      finished.set(key, { title: entry.title, video: result.url, chapters });
      return { ...result, chapters };
    } finally {
      live.delete(id);
      await entry.browser.close().catch(() => {});
    }
  }

  const act = async (id: string, action: Action) => {
    const entry = get(id);
    await entry.session.act(action);
    return json({ ok: true, elapsedSeconds: entry.session.elapsedSeconds });
  };

  const localTools: LocalTool[] = [
    tool(
      "start_recording",
      "Record a browser",
      "Opens a hidden browser on the user's computer at the URL and starts recording it, without touching their mouse, keyboard or windows, so they can keep working. Unlike the cloud recorder it can open localhost, 127.0.0.1 and the local network, so it records apps the user is running. " +
        "Then drive it with look, click, type, press, scroll and navigate; only those actions are recorded, not the time you spend thinking. " +
        "Ends on stop_recording, after 5 minutes without an action, or at 30 minutes.",
      {
        url: z.string().url().max(2000),
        title: z
          .string()
          .max(200)
          .optional()
          .describe("Defaults to the page's title."),
        visibility,
        workspace_id: workspaceId,
        voiceover: z
          .boolean()
          .optional()
          .describe(
            "Set when you'll narrate, so the voice loads while you set up.",
          ),
      },
      async ({ url, title, visibility, workspace_id, voiceover }) => {
        guardOne();
        if (voiceover) warmVoice(settings.tts);
        const out = await output("tab", title ?? new URL(url).host);
        const [browser, ffmpeg] = await Promise.all([
          launch(settings.headless),
          resolveFfmpeg(settings.ffmpeg),
        ]);
        try {
          const session = await startSession(
            browser,
            {
              url,
              title,
              visibility,
              workspaceId: workspace_id,
              width: settings.viewport.width,
              height: settings.viewport.height,
              maxDurationMs: MAX_RECORDING_MS,
              idleMs: IDLE_MS,
              output: out,
            },
            { allowUrl: async () => true, ffmpegPath: ffmpeg },
          );
          const id = randomBytes(16).toString("hex");
          live.set(id, {
            kind: "browser",
            session,
            browser,
            title: title ?? url,
          });
          return json({
            recording_id: id,
            max_minutes: Math.floor(session.maxDurationMs / 60_000),
          });
        } catch (err) {
          await browser.close().catch(() => {});
          throw err;
        }
      },
    ),
    tool(
      "list_screens",
      "List screens and windows",
      "Lists the displays and the open app windows start_screen_recording can record.",
      {},
      async () => {
        const { displays, windows } = await listScreens();
        return json({
          displays: displays.map((d) => ({
            display: d.index + 1,
            name: d.name,
            size: `${d.width}x${d.height}`,
          })),
          windows: [
            ...new Map(
              windows.map((w) => [
                `${w.app}\n${w.title}`,
                { app: w.app, title: w.title || undefined },
              ]),
            ).values(),
          ],
        });
      },
    ),
    tool(
      "start_screen_recording",
      "Record the screen or an app",
      "Starts recording the user's whole display, or one app's window, as it is. It doesn't click or type: do the work with your own tools (run commands, open apps) while it records, and use show_slide, wait and narrate here. " +
        "The recording runs straight through until stop_recording, up to 30 minutes. The first time, the operating system may ask the user to allow screen recording for the app running you.",
      {
        app: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe(
            "Record only this app's window: its name, like 'Terminal' or 'Figma', or part of the window's title.",
          ),
        display: z
          .number()
          .int()
          .min(1)
          .max(16)
          .optional()
          .describe(
            "Which display to record when no app is given; list_screens numbers them. Defaults to 1.",
          ),
        title: z.string().max(200).optional(),
        visibility,
        workspace_id: workspaceId,
        voiceover: z
          .boolean()
          .optional()
          .describe(
            "Set when you'll narrate, so the voice loads while you set up.",
          ),
      },
      async ({ app, display, title, visibility, workspace_id, voiceover }) => {
        guardOne();
        if (voiceover) warmVoice(settings.tts);
        const screens = await listScreens();
        if (!screens.displays.length)
          throw new ToolError("No display found to record.");
        let target: ScreenTarget;
        let label: string;
        if (app) {
          const window = findWindow(screens.windows, app);
          if (!window) {
            const apps = [...new Set(screens.windows.map((w) => w.app))].join(
              ", ",
            );
            throw new ToolError(
              `No open window matches "${app}". Open windows: ${apps || "none found"}. Bring the app's window onto the screen, or record the display instead.`,
            );
          }
          target = {
            kind: "window",
            window,
            display: displayFor(screens.displays, window),
          };
          label = window.title ? `${window.app}: ${window.title}` : window.app;
        } else {
          const d = screens.displays[(display ?? 1) - 1];
          if (!d)
            throw new ToolError(
              `There's no display ${display}; this computer has ${screens.displays.length}.`,
            );
          target = { kind: "display", display: d };
          label = d.name;
        }
        const out = await output(
          target.kind === "window" ? "window" : "screen",
          title ?? label,
        );
        const [browser, ffmpeg] = await Promise.all([
          launch(true),
          resolveFfmpeg(settings.ffmpeg),
        ]);
        try {
          const session = await startScreenSession(browser, {
            target,
            label,
            title,
            visibility,
            workspaceId: workspace_id,
            output: out,
            maxDurationMs: MAX_RECORDING_MS,
            width: settings.viewport.width,
            height: settings.viewport.height,
            ffmpeg,
          });
          const id = randomBytes(16).toString("hex");
          live.set(id, {
            kind: "screen",
            session,
            browser,
            title: title ?? label,
          });
          return json({
            recording_id: id,
            recording: label,
            max_minutes: Math.floor(session.maxDurationMs / 60_000),
          });
        } catch (err) {
          await browser.close().catch(() => {});
          throw err;
        }
      },
    ),
    tool(
      "look",
      "Look at the recording",
      "Returns a screenshot of what's being recorded, plus for a browser its URL, title and an accessibility outline to find elements by. Not recorded.",
      { recording_id: recordingId },
      async ({ recording_id }) => {
        const entry = get(recording_id);
        const { image, ...rest } = await entry.session.look();
        return {
          content: [
            { type: "image", data: image, mimeType: "image/jpeg" },
            { type: "text", text: JSON.stringify(rest, null, 2) },
          ],
        };
      },
    ),
    tool(
      "click",
      "Click",
      "Moves the cursor to an element and clicks it. Browser recordings only.",
      { recording_id: recordingId, target },
      ({ recording_id, target }) =>
        act(recording_id, { type: "click", target }),
    ),
    tool(
      "type",
      "Type",
      "Types text, into the given field or wherever the focus is. Browser recordings only.",
      {
        recording_id: recordingId,
        text: z.string().min(1).max(2000),
        target: target.optional(),
        submit: z.boolean().optional().describe("Press Enter after typing."),
      },
      ({ recording_id, text, target, submit }) =>
        act(recording_id, { type: "type", text, target, submit }),
    ),
    tool(
      "press",
      "Press a key",
      "Presses a key or shortcut, like 'Enter' or 'Meta+K'. Browser recordings only.",
      { recording_id: recordingId, key: z.string().min(1).max(40) },
      ({ recording_id, key }) => act(recording_id, { type: "press", key }),
    ),
    tool(
      "scroll",
      "Scroll",
      "Scrolls the page smoothly. Browser recordings only.",
      {
        recording_id: recordingId,
        direction: z.enum(["down", "up"]),
        amount: z
          .number()
          .min(0.1)
          .max(5)
          .optional()
          .describe("In screen heights; defaults to 0.8."),
      },
      ({ recording_id, direction, amount }) =>
        act(recording_id, { type: "scroll", direction, amount }),
    ),
    tool(
      "navigate",
      "Go to a URL",
      "Opens a URL in the recorded tab. Browser recordings only.",
      { recording_id: recordingId, url: z.string().url().max(2000) },
      ({ recording_id, url }) => act(recording_id, { type: "navigate", url }),
    ),
    tool(
      "wait",
      "Wait",
      "Holds on the current view so a viewer can take it in, up to 10 seconds.",
      { recording_id: recordingId, seconds: z.number().min(0.5).max(10) },
      ({ recording_id, seconds }) =>
        act(recording_id, { type: "wait", seconds }),
    ),
    tool(
      "show_slide",
      "Show a slide",
      "Cuts the recording to a full-screen slide; call hide_slide to cut back. Pick a layout: " +
        "cover (opening title + subtitle), list (title + numbered items, for steps or contents), " +
        "statement (one big sentence + subtitle), feature (tag + title + subtitle, with up to 3 facts or an image), " +
        "big_idea (a few huge words + a from/to caption). Keep text short: a headline of a few words, a subtitle of one sentence. " +
        "Use section and page/total for a running top bar across a deck. Each slide becomes a chapter.",
      {
        recording_id: recordingId,
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
          .describe("For feature: an image shown beside the text."),
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
      ({ recording_id, image_url, ...slide }) =>
        act(recording_id, {
          type: "show_slide",
          slide: { ...slide, imageUrl: image_url },
        }),
    ),
    tool(
      "hide_slide",
      "Hide the slide",
      "Cuts back from the slide to what's being recorded.",
      { recording_id: recordingId },
      ({ recording_id }) => act(recording_id, { type: "hide_slide" }),
    ),
    tool(
      "narrate",
      "Say something",
      `Speaks the text as a voiceover in the recording and returns once it has been said. Narrate what the viewer is looking at, a sentence or two per call, then act. ` +
        (settings.tts.provider === "kokoro"
          ? `The voice runs on this computer (Kokoro); the first line downloads it once. Voices: ${KOKORO_VOICES.join(", ")} (af_ and bf_ are female, am_ and bm_ male; a_ American, b_ British). Defaults to af_heart.`
          : settings.tts.provider === "openai"
            ? "The voice comes from the user's own speech server; voice names are that server's."
            : "The voice is the operating system's own; voice names are the system's."),
      {
        recording_id: recordingId,
        text: z.string().min(1).max(600),
        voice: z.string().max(60).optional(),
      },
      async ({ recording_id, text, voice }) => {
        const entry = get(recording_id);
        const ffmpeg = await resolveFfmpeg(settings.ffmpeg);
        const speech = await speak(text, voice, settings.tts, ffmpeg);
        await entry.session.play(speech.pcm);
        return json({
          ok: true,
          elapsedSeconds: entry.session.elapsedSeconds,
          ...(speech.note ? { note: speech.note } : {}),
        });
      },
    ),
    tool(
      "stop_recording",
      "Stop and get the link",
      "Ends the recording and returns its link and chapters. Give the link to the user.",
      { recording_id: recordingId },
      async ({ recording_id }) => {
        const done = await end(recording_id, "stop");
        return json({
          url: done!.url,
          duration_seconds: done!.durationSeconds,
          chapters: done!.chapters.map((c) => ({
            at: formatAt(c.ms),
            title: c.title,
          })),
        });
      },
    ),
    tool(
      "cancel_recording",
      "Cancel a recording",
      "Ends the recording and throws it away.",
      { recording_id: recordingId },
      async ({ recording_id }) => {
        await end(recording_id, "cancel");
        return json({ cancelled: true });
      },
      true,
    ),
    tool(
      "create_report",
      "Write a report on a recording",
      "Puts a report on a finished recording's page: a plain-text summary above the video (what you did, what you checked, what failed; line breaks and '- ' lists are kept, Markdown isn't rendered) and chapters viewers click to jump. " +
        "Leave out chapters to use the ones the recording collected from its slides and pages.",
      {
        recording: z
          .string()
          .min(1)
          .max(2000)
          .describe("The link stop_recording returned."),
        summary: z.string().min(1).max(4000),
        chapters: z
          .array(
            z.object({
              seconds: z.number().min(0),
              title: z.string().min(1).max(120),
            }),
          )
          .max(100)
          .optional(),
      },
      async ({ recording, summary, chapters }) => {
        const isFile = recording.startsWith("file:");
        const key = isFile ? fileURLToPath(recording) : slugFromLink(recording);
        if (!key)
          throw new ToolError("That isn't a CaptureFlow recording link.");
        const known = finished.get(key);
        const list = chapters
          ? chapters.map((c) => ({ ms: c.seconds * 1000, title: c.title }))
          : (known?.chapters ?? []);
        if (isFile) {
          const md = key.replace(/\.mp4$/, ".md");
          await writeFile(
            md,
            reportMarkdown(
              known?.title ?? "Recording",
              recording,
              summary,
              list,
            ),
          );
          return json({ ok: true, report: md });
        }
        await putReport(
          settings.url,
          await requireCredentials(),
          key,
          summary,
          list,
        );
        return json({ ok: true, url: recording });
      },
    ),
  ];

  const byName = new Map(localTools.map((t) => [t.name, t]));

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const local: Tool[] = localTools.map((t) => {
      const { $schema: _, ...schema } = z.toJSONSchema(t.input, {
        io: "input",
      }) as Record<string, unknown>;
      return {
        name: t.name,
        title: t.title,
        description: t.description,
        inputSchema: schema as Tool["inputSchema"],
        ...(t.destructive ? { annotations: { destructiveHint: true } } : {}),
      };
    });
    const remote = settings.saveDir
      ? []
      : await library.tools(await credentials());
    return { tools: [...local, ...remote] };
  });

  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    const { name, arguments: args = {} } = req.params;
    try {
      const local = byName.get(name);
      if (local) {
        const parsed = local.input.safeParse(args);
        if (!parsed.success) return failure(z.prettifyError(parsed.error));
        return await local.run(parsed.data as never);
      }
      if (library.has(name))
        return await library.call(await requireCredentials(), name, args);
      return failure(`Unknown tool ${name}.`);
    } catch (err) {
      if (err instanceof ToolError || err instanceof SessionError)
        return failure(err.message);
      console.error("[captureflow-mcp]", err);
      return failure(`Something went wrong: ${(err as Error).message}`);
    }
  });

  return {
    async listen() {
      await server.connect(new StdioServerTransport());
    },
    async close() {
      await Promise.all(
        [...live.keys()].map((id) => end(id, "cancel").catch(() => {})),
      );
      library.reset();
      await server.close();
    },
  };
}
