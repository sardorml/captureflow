import type { ReactElement } from "react";
import { Tooltip } from "@heroui/react";
import { formatRelativeLong as formatRelative } from "@/lib/format";

export type ContentBylineProps = {
  ownerName: string | null;
  createdAt: number;
};

export function ContentByline({
  ownerName,
  createdAt,
}: ContentBylineProps): ReactElement {
  const relative = formatRelative(createdAt);
  const absolute = formatAbsolute(createdAt);
  return (
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-fg-muted">
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
    </p>
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
