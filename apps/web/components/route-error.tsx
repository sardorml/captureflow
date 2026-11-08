"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorFallback } from "@/components/error-boundary";
import { SessionStalled } from "@/components/session-stalled";
import { SESSION_STALLED_DIGEST } from "@/lib/session-lookup";

// The body of a route's error.tsx: trying again also fetches the route's server data again.
export function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  if (error.digest === SESSION_STALLED_DIGEST) return <SessionStalled />;
  return (
    <ErrorFallback
      error={error}
      scope="page"
      reset={() =>
        startTransition(() => {
          router.refresh();
          reset();
        })
      }
    />
  );
}
