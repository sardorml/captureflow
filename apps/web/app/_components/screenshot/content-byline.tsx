import type { ReactElement, ReactNode } from "react";
import { Tooltip } from "@heroui/react";
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
        <Tooltip.Trigger className="cursor-default" tabIndex={0}>
          {relative}
        </Tooltip.Trigger>
        <Tooltip.Content>{absolute}</Tooltip.Content>
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
