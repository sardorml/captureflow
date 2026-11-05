"use client";

import { useSyncExternalStore } from "react";
import { useAppLocale } from "@/components/app-i18n-provider";
import { formatPostedAt, formatRelativeShort } from "@/lib/format";
import { formatDate } from "@/lib/i18n/intl";

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
  const { lang } = useAppLocale();
  const label = useSyncExternalStore(
    noSubscribe,
    () => formatPostedAt(at, Date.now(), { lang }),
    () => formatRelativeShort(at, lang),
  );
  const full = useSyncExternalStore(
    noSubscribe,
    () => formatDate(at, lang, { dateStyle: "full", timeStyle: "short" }),
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
