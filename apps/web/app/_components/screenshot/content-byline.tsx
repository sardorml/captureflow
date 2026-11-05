"use client";

import type { ReactElement, ReactNode } from "react";
import { useAppLocale } from "@/components/app-i18n-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatRelativeLong as formatRelative } from "@/lib/format";
import { formatDate } from "@/lib/i18n/intl";

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
  const { lang } = useAppLocale();
  const relative = formatRelative(createdAt, lang);
  const absolute = formatAbsolute(createdAt, lang);
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

function formatAbsolute(epochMs: number, lang: string): string {
  return formatDate(
    epochMs,
    lang,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
    "en-US",
  );
}
