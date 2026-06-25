import type { ReactElement } from "react";
import { Tooltip } from "antd";
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
      <Tooltip title={absolute}>
        <span className="cursor-default">{relative}</span>
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
