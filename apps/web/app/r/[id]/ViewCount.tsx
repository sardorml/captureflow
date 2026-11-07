"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Eye, User, Users } from "lucide-react";
import type { RecordingViewerEntry } from "@/lib/recording/types";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { formatRelativeLong, initials } from "@/lib/format";
import { fmt, plural } from "@/lib/i18n/format";
import { formatNumber } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  // Null for anyone but the owner, who alone gets the list.
  viewers: RecordingViewerEntry[] | null;
  variant?: "pill" | "inline";
  className?: string;
};

const INLINE_CLASS = "inline-flex items-center gap-1 tabular-nums";

// The title row's hover box, so the two read as one row: same height and
// corner radius, on the panel surface (white in light mode).
const PILL_CLASS =
  "inline-flex h-10 shrink-0 items-center rounded-xl bg-panel px-4 text-sm font-medium text-fg ring-1 ring-line";

function useViewsLabel(): (n: number) => string {
  const m = useAppMessages();
  const { lang } = useAppLocale();
  return (n) =>
    fmt(plural(m.viewer.views.count, n, lang), {
      count: formatNumber(n, lang),
    });
}

export function ViewCount({
  count,
  viewers,
  variant = "inline",
  className,
}: Props) {
  const pill = variant === "pill";
  const copy = useAppMessages().viewer.views;
  const viewsLabel = useViewsLabel();
  const label = (
    <>
      {pill ? null : <Eye className="size-3.5" aria-hidden="true" />}
      {viewsLabel(count)}
    </>
  );
  if (!viewers) {
    return (
      <span className={cn(pill ? PILL_CLASS : INLINE_CLASS, className)}>
        {label}
      </span>
    );
  }
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            pill
              ? cn(PILL_CLASS, "min-w-0 transition-colors hover:bg-tint-strong")
              : cn(
                  INLINE_CLASS,
                  "-mx-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-tint hover:text-fg",
                ),
            "focus-visible:outline-2 focus-visible:outline-primary",
            className,
          )}
          aria-label={fmt(copy.showWhoWatched, { views: viewsLabel(count) })}
        >
          {label}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={pill ? "end" : "start"}
        aria-label={copy.viewers}
        className="w-80 gap-0 p-0 outline-none"
      >
        {viewers.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-tint text-fg-muted">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-semibold text-fg">
              {copy.emptyTitle}
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              {copy.emptyDescription}
            </p>
          </div>
        ) : (
          <>
            <p className="px-4 pt-3 pb-2 text-sm font-semibold text-fg">
              {copy.viewers}
            </p>
            <ul className="max-h-80 overflow-y-auto pb-2">
              {viewers.map((entry, index) => (
                <ViewerRow
                  key={entry.userId ?? `anon-${index}`}
                  entry={entry}
                />
              ))}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function ViewerRow({ entry }: { entry: RecordingViewerEntry }) {
  const copy = useAppMessages().viewer.views;
  const { lang } = useAppLocale();
  const viewsLabel = useViewsLabel();
  const name =
    entry.name?.trim() ||
    entry.email ||
    (entry.userId ? copy.signedInViewer : copy.anonymous);
  const detail = [
    formatRelativeLong(entry.lastViewedAt, lang),
    entry.views > 1 ? viewsLabel(entry.views) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="flex items-center gap-3 px-4 py-2">
      {entry.userId ? (
        <Avatar className="size-8 shrink-0">
          {entry.image ? <AvatarImage src={entry.image} alt="" /> : null}
          <AvatarFallback className="text-xs">{initials(name)}</AvatarFallback>
        </Avatar>
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-tint text-fg-muted">
          <User className="size-4" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-fg">{name}</p>
        <p className="truncate text-xs text-fg-muted">{detail}</p>
      </div>
    </li>
  );
}
