"use client";

import { useSyncExternalStore } from "react";
import { formatPostedAt, formatRelativeShort } from "@/lib/format";

const noSubscribe = () => () => {};

// The server has no idea of the viewer's timezone, so it renders the relative
// time and the browser swaps in the local date once hydrated.
export function PostedAt({
  at,
  className,
}: {
  at: number;
  className?: string;
}) {
  const label = useSyncExternalStore(
    noSubscribe,
    () => formatPostedAt(at),
    () => formatRelativeShort(at),
  );
  const full = useSyncExternalStore(
    noSubscribe,
    () =>
      new Date(at).toLocaleString(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      }),
    () => undefined,
  );
  return (
    <time
      dateTime={new Date(at).toISOString()}
      title={full}
      className={className}
    >
      {label}
    </time>
  );
}
