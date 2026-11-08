"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { ErrorFallback } from "@/components/error-boundary";

// The body of a route's error.tsx: trying again also fetches the route's server data again.
export function RouteError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();
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
