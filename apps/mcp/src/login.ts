import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { hostname } from "node:os";
import { saveCredentials, type Credentials } from "./config";

const LOGIN_TIMEOUT_MS = 10 * 60_000;

export function openUrl(url: string): void {
  const [cmd, args] =
    process.platform === "darwin"
      ? ["open", [url]]
      : process.platform === "win32"
        ? ["rundll32", ["url.dll,FileProtocolHandler", url]]
        : ["xdg-open", [url]];
  const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

const PAGE = (message: string) =>
  `<!doctype html><meta charset="utf-8"><title>CaptureFlow</title><body style="font:16px system-ui;display:grid;place-items:center;height:100vh;margin:0"><p>${message}</p></body>`;

export type PendingLogin = { url: string; done: Promise<Credentials> };

/*
 * Signs in the way native apps do (RFC 8252): a listener on a random loopback
 * port, and the browser sent to the site's /auth/callback with that port as
 * its return. The state value ties the answer to this attempt.
 */
export async function startLogin(
  base: string,
  open = true,
): Promise<PendingLogin> {
  const state = randomBytes(16).toString("hex");
  let settle!: { resolve(c: Credentials): void; reject(e: Error): void };
  const done = new Promise<Credentials>((resolve, reject) => {
    settle = { resolve, reject };
  });
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname !== "/callback") {
      res.writeHead(404).end();
      return;
    }
    const token = url.searchParams.get("token") ?? "";
    const tokenId = url.searchParams.get("id") ?? "";
    if (url.searchParams.get("state") !== state || token.length < 32) {
      res.writeHead(400, { "content-type": "text/html" });
      res.end(
        PAGE("That sign-in link didn't match. Start again from your terminal."),
      );
      return;
    }
    const creds: Credentials = {
      token,
      tokenId,
      deviceId: `local-mcp-${randomBytes(6).toString("hex")}`,
    };
    try {
      await saveCredentials(base, creds);
    } catch (err) {
      res.writeHead(500, { "content-type": "text/html" });
      res.end(
        PAGE("Signed in, but the token couldn't be saved on this computer."),
      );
      settle.reject(err as Error);
      return finish();
    }
    res.writeHead(200, { "content-type": "text/html" });
    res.end(PAGE("Signed in to CaptureFlow. You can close this tab."));
    settle.resolve(creds);
    finish();
  });
  const timer = setTimeout(() => {
    settle.reject(new Error("Sign-in timed out."));
    finish();
  }, LOGIN_TIMEOUT_MS);
  function finish() {
    clearTimeout(timer);
    server.close();
  }
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address() as { port: number };
  const back = `http://127.0.0.1:${port}/callback?state=${state}`;
  const url = `${base}/auth/callback?label=${encodeURIComponent(`Local MCP on ${hostname()}`)}&return=${encodeURIComponent(back)}`;
  if (open) openUrl(url);
  return { url, done };
}
