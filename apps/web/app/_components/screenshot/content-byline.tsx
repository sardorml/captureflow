import type { ReactElement, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRelativeLong as formatRelative } from "@/lib/format";

export type ContentBylineProps = {
  ownerName: string | null;
  createdAt: number;
  leading?: ReactNode;
};

export function ContentByline({
  ownerName,
  createdAt,
  leading,
}: ContentBylineProps): ReactElement {
  const relative = formatRelative(createdAt);
  const absolute = formatAbsolute(createdAt);
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-fg-muted">
      {leading}
      {ownerName ? (
        <>
          <span className="text-fg">{ownerName}</span>
          <span className="text-fg-subtle">·</span>
        </>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-default" tabIndex={0}>
            {relative}
          </span>
        </TooltipTrigger>
        <TooltipContent>{absolute}</TooltipContent>
      </Tooltip>
    </div>
  );
}

function formatAbsolute(epochMs: number): string {
  return new Date(epochMs).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
