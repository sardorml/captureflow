"use client";

import { Avatar, Button, Popover } from "@heroui/react";
import { User, Users } from "lucide-react";
import type { RecordingViewerEntry } from "@/lib/recording/types";
import { formatRelativeLong, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  count: number;
  // Null for anyone but the owner, who alone gets the list.
  viewers: RecordingViewerEntry[] | null;
  className?: string;
};

// The title row's hover box, so the two read as one row: same height and
// corner radius, on the panel surface (white in light mode).
const PILL_CLASS =
  "inline-flex h-12 shrink-0 items-center rounded-xl bg-panel px-4 text-sm font-medium text-fg lg:h-11";

const viewsLabel = (n: number): string =>
  `${n.toLocaleString()} ${n === 1 ? "view" : "views"}`;

export function ViewCount({ count, viewers, className }: Props) {
  if (!viewers) {
    return (
      <span className={cn(PILL_CLASS, className)}>{viewsLabel(count)}</span>
    );
  }
  return (
    <Popover>
      <Popover.Trigger className={cn("inline-flex", className)}>
        <Button
          variant="ghost"
          className={cn(PILL_CLASS, "min-w-0 hover:bg-tint-strong")}
          aria-label={`${viewsLabel(count)}, show who watched`}
        >
          {viewsLabel(count)}
        </Button>
      </Popover.Trigger>
      <Popover.Content placement="bottom end" className="w-80 p-0">
        <Popover.Dialog aria-label="Viewers" className="outline-none">
          {viewers.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-tint text-fg-muted">
                <Users className="size-6" aria-hidden="true" />
              </span>
              <p className="mt-4 text-base font-semibold text-fg">
                No views yet
              </p>
              <p className="mt-1 text-sm text-fg-muted">
                Share the link and the people who watch show up here.
              </p>
            </div>
          ) : (
            <>
              <p className="px-4 pt-3 pb-2 text-sm font-semibold text-fg">
                Viewers
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
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}

function ViewerRow({ entry }: { entry: RecordingViewerEntry }) {
  const name =
    entry.name?.trim() ||
    entry.email ||
    (entry.userId ? "Signed-in viewer" : "Anonymous");
  const detail = [
    formatRelativeLong(entry.lastViewedAt),
    entry.views > 1 ? viewsLabel(entry.views) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <li className="flex items-center gap-3 px-4 py-2">
      {entry.userId ? (
        <Avatar className="size-8 shrink-0">
          {entry.image ? <Avatar.Image src={entry.image} alt="" /> : null}
          <Avatar.Fallback className="text-xs">
            {initials(name)}
          </Avatar.Fallback>
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
