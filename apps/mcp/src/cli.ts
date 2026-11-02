import { clearCredentials, loadCredentials, readSettings } from "./config";
import { startLogin } from "./login";
import { createLocalServer, VERSION } from "./server";

const HELP = `captureflow-mcp ${VERSION}: CaptureFlow's MCP server, on your own computer.

Usage:
  captureflow-mcp              Run the server over stdio (what your agent starts).
  captureflow-mcp login        Sign in to CaptureFlow in your browser.
  captureflow-mcp logout       Forget this computer's sign-in.
  captureflow-mcp status       Show where recordings go and who's signed in.

Add it to Claude Code:
  claude mcp add captureflow -- npx -y @captureflow/mcp

Options:
  --show-browser      Show the browser window while recording (hidden by default).
  --no-browser        With login: print the sign-in link instead of opening it.
  --save-dir <dir>    Save recordings as MP4 files in <dir> instead of uploading.
  --url <url>         The CaptureFlow site (default https://captureflow.dev).

Environment:
  CAPTUREFLOW_TTS        kokoro (default), system, or openai
  CAPTUREFLOW_TTS_URL    An OpenAI-compatible speech server, e.g. http://localhost:8880/v1
  CAPTUREFLOW_TTS_MODEL  CAPTUREFLOW_TTS_KEY  CAPTUREFLOW_TTS_VOICE
  CAPTUREFLOW_VIEWPORT   Browser size, default 1920x1080
  CAPTUREFLOW_FFMPEG     Path to ffmpeg, if it isn't on PATH`;

async function main() {
  const argv = process.argv.slice(2);
  const command = argv[0]?.startsWith("--") ? undefined : argv[0];
  const settings = readSettings(argv);

  if (argv.includes("--help") || argv.includes("-h") || command === "help") {
    console.log(HELP);
    return;
  }
  if (argv.includes("--version")) {
    console.log(VERSION);
    return;
  }
  if (command === "login") {
    const open = !argv.includes("--no-browser");
    const pending = await startLogin(settings.url, open);
    console.log(
      `${open ? "Opening" : "Open this link in a browser on this computer:"} ${pending.url}\nSign in there to connect this computer.`,
    );
    await pending.done;
    console.log("Signed in. Your agent can record now.");
    return;
  }
  if (command === "logout") {
    await clearCredentials(settings.url);
    console.log(
      `Signed out on this computer. To end the token on the site too, revoke it at ${settings.url}/devices.`,
    );
    return;
  }
  if (command === "status") {
    const creds = await loadCredentials(settings.url);
    console.log(
      settings.saveDir
        ? `Recordings are saved to ${settings.saveDir}.`
        : creds
          ? `Signed in to ${settings.url}; recordings upload there.`
          : `Not signed in to ${settings.url}. Run \`captureflow-mcp login\`.`,
    );
    console.log(
      `Voice: ${settings.tts.provider}${settings.tts.url ? ` (${settings.tts.url})` : ""}`,
    );
    return;
  }
  if (command) {
    console.error(`Unknown command "${command}".\n\n${HELP}`);
    process.exitCode = 1;
    return;
  }

  // stdout carries the protocol, so anything else goes to stderr.
  console.log = console.error;
  const server = createLocalServer(settings);
  // The voice model's native threads crash on process.exit, so the process is left to end once everything has closed.
  let closing = false;
  const shutdown = () => {
    if (closing) return;
    closing = true;
    void server.close().finally(() => {
      process.stdin.destroy();
      setTimeout(() => process.exit(0), 3000).unref();
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.stdin.on("close", shutdown);
  await server.listen();
}

main().catch((err: Error) => {
  console.error(err.message);
  process.exit(1);
});
