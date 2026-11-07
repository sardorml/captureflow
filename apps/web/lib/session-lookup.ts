import { withTimeout } from "./with-timeout";

const ATTEMPT_MS = 2500;
const ATTEMPTS = 2;

// The lookup gave no answer at all, which is not the same as signed out: callers must not redirect to sign-in on it.
export class SessionLookupStalled extends Error {
  constructor(label: string) {
    super(`Session lookup for ${label} stalled`);
    this.name = "SessionLookupStalled";
  }
}

/*
 * Prod lookups on long-lived isolates have waited minutes on a database
 * answer that never came, with no CPU used. Each attempt is capped and
 * retried once; a stalled attempt logs whether the database still answers
 * a trivial query from this isolate, to find the cause.
 */
export async function lookupSession<T>(
  read: () => Promise<T>,
  label: string,
  {
    attemptMs = ATTEMPT_MS,
    probe,
  }: { attemptMs?: number; probe?: () => Promise<string> } = {},
): Promise<T> {
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    const result = await withTimeout(
      read().then((value) => ({ value })),
      attemptMs,
      null,
    );
    if (result) return result.value;
    const health = probe ? await probe().catch((e) => `probe threw: ${e}`) : "";
    console.warn(
      `[session] ${label} stalled past ${attemptMs}ms (attempt ${attempt}) ${health}`,
    );
  }
  throw new SessionLookupStalled(label);
}

// How a trivial query fares on this isolate, for the stall log.
export async function probeDatabase(
  db: D1Database | undefined,
  ms = 1500,
): Promise<string> {
  if (!db) return "d1: no binding";
  const from = Date.now();
  const answered = await withTimeout(
    db
      .prepare("SELECT 1")
      .first()
      .then(() => true),
    ms,
    false,
  );
  return answered
    ? `d1: answered in ${Date.now() - from}ms`
    : `d1: no answer in ${ms}ms`;
}
