import { logAccess } from "@/lib/access-log";
import { getAuth } from "@/lib/auth";
import { runInBackground } from "@/lib/cf-env";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await getAuth();
  return auth.handler(req);
}

export async function GET(req: Request) {
  const auth = await getAuth();
  const res = await auth.handler(req);
  if (res.ok && new URL(req.url).pathname.endsWith("/get-session")) {
    void runInBackground(logSessionCheck(req, res.clone()));
  }
  return res;
}

// The browser's own session checks (tab focus, polling) are what most often
// mark someone active without them doing anything, so they are logged too.
async function logSessionCheck(req: Request, res: Response): Promise<void> {
  try {
    const body = (await res.json()) as {
      session?: { id?: unknown; userId?: unknown };
    } | null;
    const id = body?.session?.id;
    const userId = body?.session?.userId;
    if (typeof id === "string" && typeof userId === "string") {
      logAccess({ userId, via: "session", credentialId: id, request: req });
    }
  } catch {}
}
