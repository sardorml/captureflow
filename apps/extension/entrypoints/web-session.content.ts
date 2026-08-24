import { sendMessage } from "@/lib/messaging";
import type { WebSession } from "@/lib/auth/sync";

/*
 * Dev-only localhost, mirroring the manifest's other origin lists: a published
 * build that ran here on any localhost page would let a hostile local app
 * answer for the dashboard and force a re-login. Keyed off MODE, not COMMAND —
 * `wxt build --mode development` reports COMMAND === "build", so a COMMAND
 * check left every dev build with production's origins and this script never
 * ran against the dev server at all.
 */
const MATCHES =
  import.meta.env.MODE !== "production"
    ? ["https://captureflow.dev/*", "http://localhost/*"]
    : ["https://captureflow.dev/*"];

/*
 * The dashboard reads this off <html> to decide whether its record buttons can
 * hand off to the extension or have to send the user to the store. It is the
 * only reliable answer: an unpacked build's id is derived from its path, so
 * nothing the web app could hard-code would address it. Mirrored in apps/web's
 * lib/extension-bridge.ts.
 */
const PRESENCE_ATTRIBUTE = "data-captureflow-extension";

/*
 * A content script runs in the page's own origin, so this is a same-origin
 * request and carries the dashboard's cookies. Nothing else in the extension
 * can see them — they aren't attached to extension-context fetches — and this
 * is the only reading of "is this browser still signed in, and as whom" that
 * doesn't depend on a page volunteering it.
 *
 * A reply we can't read means we learned nothing, which must leave the token
 * alone rather than sign anyone out.
 */
async function readWebSession(): Promise<WebSession | null> {
  let res: Response;
  try {
    res = await fetch("/api/verify-session", { credentials: "same-origin" });
  } catch {
    return null;
  }
  const body = (await res.json().catch(() => null)) as {
    userId?: unknown;
    error?: unknown;
  } | null;

  if (res.ok) {
    return typeof body?.userId === "string" && body.userId.length > 0
      ? { kind: "signed-in", userId: body.userId }
      : null;
  }
  return res.status === 401 && body?.error === "no-session"
    ? { kind: "signed-out" }
    : null;
}

export default defineContentScript({
  matches: MATCHES,
  runAt: "document_idle",
  async main() {
    document.documentElement.setAttribute(
      PRESENCE_ATTRIBUTE,
      chrome.runtime.id,
    );
    if (!(await sendMessage("hasAuthSession", undefined))) return;
    const web = await readWebSession();
    if (web) await sendMessage("webSession", web);
  },
});
