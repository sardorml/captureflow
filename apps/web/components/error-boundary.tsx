"use client";

import { Component, useEffect, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppMessages } from "@/components/app-i18n-provider";
import { isChunkLoadError, shouldReload } from "@/lib/chunk-error";
import { posthogIfLoaded } from "@/lib/posthog-client";
import { cn } from "@/lib/utils";

const RELOADED_AT_KEY = "captureflow_chunk_reload_at";

function readReloadedAt(): number | null {
  try {
    const value = Number(sessionStorage.getItem(RELOADED_AT_KEY));
    return value > 0 ? value : null;
  } catch {
    return null;
  }
}

/*
 * A missing chunk means this tab outlived a deploy: one reload fetches the
 * new code. Anything else is a real bug, reported so it can be fixed.
 * Returns whether the page is reloading.
 */
function recoverOrReport(error: Error): boolean {
  const now = Date.now();
  if (isChunkLoadError(error) && shouldReload(readReloadedAt(), now)) {
    try {
      sessionStorage.setItem(RELOADED_AT_KEY, String(now));
    } catch {}
    window.location.reload();
    return true;
  }
  posthogIfLoaded()?.captureException(error);
  console.error(error);
  return false;
}

export function ErrorFallback({
  error,
  reset,
  scope,
  className,
}: {
  error: Error;
  reset: () => void;
  scope: "page" | "part";
  className?: string;
}) {
  const copy = useAppMessages().common;
  useEffect(() => {
    recoverOrReport(error);
  }, [error]);
  const page = scope === "page";
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-center",
        page
          ? "min-h-[60vh] px-6 py-16"
          : "rounded-xl border border-border p-6 text-sm",
        className,
      )}
    >
      <TriangleAlert
        className={cn("text-muted-foreground", page ? "size-8" : "size-5")}
      />
      <p className={cn("font-semibold", page && "text-xl")}>
        {page ? copy.pageFailed : copy.partFailed}
      </p>
      <p className="max-w-sm text-muted-foreground">{copy.failedBody}</p>
      <div className="mt-1 flex gap-2">
        <Button size={page ? "lg" : "sm"} onClick={reset}>
          {copy.retry}
        </Button>
        <Button
          size={page ? "lg" : "sm"}
          variant="outline"
          onClick={() => window.location.reload()}
        >
          {copy.reload}
        </Button>
      </div>
    </div>
  );
}

type BoundaryProps = { children: ReactNode; className?: string };

// Keeps one part of a page from taking the whole page down with it.
export class ErrorBoundary extends Component<
  BoundaryProps,
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <ErrorFallback
        error={error}
        scope="part"
        className={this.props.className}
        reset={() => this.setState({ error: null })}
      />
    );
  }
}
