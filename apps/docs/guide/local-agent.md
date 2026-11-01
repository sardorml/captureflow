# Record with your AI agent

CaptureFlow's local MCP server lets an AI agent (Claude Code, Cursor, or any
MCP client) record videos on your own computer: the web app you're running on
`localhost`, your whole screen, or one app's window. It can add title slides
and a voiceover, then hands you a link you can share with anyone.

Everything runs on your machine: the browser, the screen capture and the voice.

## Set it up

You need Node.js 20 or newer.

**Claude Code**

```sh
claude mcp add captureflow -- npx -y @captureflow/mcp
```

**Cursor, Windsurf and other MCP clients**: add a stdio server to the client's
MCP config:

```json
{
  "mcpServers": {
    "captureflow": { "command": "npx", "args": ["-y", "@captureflow/mcp"] }
  }
}
```

The first time the agent records, a browser tab opens so you can sign in to
CaptureFlow. To sign in ahead of time, run `npx @captureflow/mcp login`.

## Ask for a recording

Talk to your agent the way you'd ask a teammate:

- "Record a demo of the new signup flow on localhost:3000, with a voiceover."
- "Run the test suite and record the terminal while it runs."
- "Record a walkthrough of the settings page, then write a short report on what changed."

## What it can record

| What                               | How the agent records it                                                                                                                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A web app**, including localhost | Runs a hidden browser in the background and drives it: clicks, typing, scrolling, navigating. You keep using your computer. Only the actions are recorded, not the agent's thinking time. |
| **Your screen**                    | Records a whole display as it is, while the agent works with its own tools.                                                                                                               |
| **One app's window**               | Records just that window, like Terminal, VS Code or Figma, on a dark backdrop.                                                                                                            |

The agent can cut to a full-screen slide (a title, a list of steps, a closing
line) between scenes. Every slide and page becomes a chapter viewers can jump
to.

## Reports

After a recording, the agent can write a report on it: a short summary above
the video of what it did, what it checked and anything that failed, plus
chapters. You can edit both on the recording's page.

## Voiceover

Narration is free on every plan and runs on your computer.

- **Default**: the Kokoro voice. The first narration downloads it once (about
  500 MB on disk, a minute or two); after that a sentence takes a couple of
  seconds. Ask the agent to say it'll narrate when it starts, and the download
  runs while it sets up.
- **Your own voice server**: point `CAPTUREFLOW_TTS_URL` at any server with an
  OpenAI-style `/audio/speech` endpoint, such as Kokoro-FastAPI running locally
  or OpenAI itself (set `CAPTUREFLOW_TTS_KEY`). `CAPTUREFLOW_TTS_MODEL` and
  `CAPTUREFLOW_TTS_VOICE` pick the model and voice.
- **The system voice**: set `CAPTUREFLOW_TTS=system` to use macOS speech, Windows
  speech, or `espeak-ng` on Linux.

Pass settings to the server in your client's config, for example
`claude mcp add captureflow -e CAPTUREFLOW_TTS=system -- npx -y @captureflow/mcp`.

## Permissions by platform

**macOS**: browser recordings need nothing extra. The first screen or window
recording asks you to allow **Screen & System Audio Recording** for the app
running your agent (your terminal or editor). Turn it on in System Settings →
Privacy & Security, restart that app, and ask again. While it's allowed, that
app can record your screen, so only grant it to apps you trust.

**Windows**: no prompt. Screen and window recordings start right away.

**Linux**: screen and window recordings need an X11 session (on Ubuntu, pick
"Ubuntu on Xorg" at the login screen) and `xrandr`; install `wmctrl` to record a
single window. Wayland sessions can still record the browser.

A screen recording films everything visible on that display, including
notifications. Close anything private first.

## Save files instead of uploading

Add `--save-dir <folder>` to save each recording as an MP4 in that folder, with
its report as a Markdown file beside it. Nothing is uploaded and you don't need
to sign in.

## Options

| Option / variable      | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `--show-browser`       | Show the browser window while recording (hidden by default).        |
| `--save-dir <folder>`  | Save MP4 files instead of uploading.                                |
| `CAPTUREFLOW_VIEWPORT` | The browser's size, `1920x1080` by default.                         |
| `CAPTUREFLOW_FFMPEG`   | Path to ffmpeg. Otherwise the one on your PATH, or a bundled build. |

## Limits

Recordings stop at 30 minutes; browser recordings also stop after 5 minutes
without an action. Uploaded recordings count toward your plan like any other
recording. They don't use your plan's agent recording minutes, which are for
the cloud browser.

To disconnect a computer, run `npx @captureflow/mcp logout` and revoke its token
on the [Devices](https://captureflow.dev/devices) page.
