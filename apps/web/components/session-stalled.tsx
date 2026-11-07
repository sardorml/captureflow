"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { ErrorFallback } from "@/components/error-boundary";
import { nextRetries } from "@/lib/session-retry";

const TRIES_KEY = "captureflow_session_retries";

function readTries(): number[] {
  try {
    const parsed: unknown = JSON.parse(
      sessionStorage.getItem(TRIES_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
}

/*
 * The account lookup got no answer in time, which a fresh request has always
 * cleared: the page reloads itself a couple of times before it shows the
 * error, so a stall reads as a slow load rather than a crash.
 */
export function SessionStalled() {
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    const { retry, tries } = nextRetries(readTries(), Date.now());
    if (!retry) {
      setGaveUp(true);
      return;
    }
    try {
      sessionStorage.setItem(TRIES_KEY, JSON.stringify(tries));
    } catch {}
    const id = window.setTimeout(() => window.location.reload(), 600);
    return () => window.clearTimeout(id);
  }, []);
  if (gaveUp) {
    return (
      <ErrorFallback
        error={new Error("Session lookup stalled")}
        scope="page"
        reset={() => window.location.reload()}
      />
    );
  }
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
