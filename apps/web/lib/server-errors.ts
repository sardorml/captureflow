import type { Instrumentation } from "next";
import { runInBackground } from "@/lib/cf-env";
import { POSTHOG_HOST, POSTHOG_KEY } from "@/lib/public-analytics";

type StackFrame = {
  platform: "node:javascript";
  function: string;
  filename: string;
  abs_path: string;
  lineno: number;
  colno: number;
  in_app: boolean;
};

const V8_FRAME = /^\s*at (?:(.+?) \()?(.+?):(\d+):(\d+)\)?$/;

// PostHog, like Sentry, lists frames caller first, so the throwing frame is last.
export function parseStack(stack: string | undefined): StackFrame[] {
  const frames: StackFrame[] = [];
  for (const line of (stack ?? "").split("\n")) {
    const match = V8_FRAME.exec(line);
    if (!match) continue;
    const [, fn, filename, lineno, colno] = match;
    frames.push({
      platform: "node:javascript",
      function: fn ?? "?",
      filename,
      abs_path: filename,
      lineno: Number(lineno),
      colno: Number(colno),
      in_app: !filename.includes("node_modules"),
    });
  }
  return frames.reverse();
}

export function exceptionEvent(
  error: unknown,
  request: { path: string; method: string },
  context: { routePath: string; routeType: string },
) {
  const err =
    error instanceof Error ? error : new Error(String(error ?? "Unknown"));
  return {
    api_key: POSTHOG_KEY,
    event: "$exception",
    distinct_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    properties: {
      $process_person_profile: false,
      $exception_list: [
        {
          type: err.name,
          value: err.message,
          mechanism: { type: "onRequestError", handled: false },
          stacktrace: { type: "raw", frames: parseStack(err.stack) },
        },
      ],
      $current_url: request.path,
      method: request.method,
      route: context.routePath,
      route_type: context.routeType,
      source: "server",
    },
  };
}

export const reportRequestError: Instrumentation.onRequestError = (
  error,
  request,
  context,
) => {
  if (!POSTHOG_KEY || process.env.NODE_ENV !== "production") return;
  void runInBackground(
    fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(exceptionEvent(error, request, context)),
      signal: AbortSignal.timeout(5_000),
    }),
  );
};
