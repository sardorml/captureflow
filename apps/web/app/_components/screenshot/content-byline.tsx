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
import { cn } from "@/lib/utils";

export type ContentBylineProps = {
  ownerName: string | null;
  createdAt: number;
  leading?: ReactNode;
  trailing?: ReactNode;
  trailingClassName?: string;
};

export function ContentByline({
  ownerName,
  createdAt,
  leading,
  trailing,
  trailingClassName,
}: ContentBylineProps): ReactElement {
  const { lang } = useAppLocale();
  const relative = formatRelative(createdAt, lang);
  const absolute = formatAbsolute(createdAt, lang);
  // Beside an avatar on phones, the name sits over the time and anything after it.
  const stacked = leading != null;
  return (
    <div className="mt-1 flex items-center gap-x-2.5 text-sm text-fg-muted">
      {leading}
      <div
        className={cn(
          "flex min-w-0 flex-wrap items-center gap-x-1.5",
          stacked && "max-lg:flex-col max-lg:items-start max-lg:gap-0.5",
        )}
      >
        {ownerName ? (
          <span className="flex items-center gap-x-1.5">
            <span className="text-fg">{ownerName}</span>
            <span className={cn("text-fg-subtle", stacked && "max-lg:hidden")}>
              ·
            </span>
          </span>
        ) : null}
        <span className="flex items-center gap-x-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default" tabIndex={0}>
                {relative}
              </span>
            </TooltipTrigger>
            <TooltipContent>{absolute}</TooltipContent>
          </Tooltip>
          {trailing ? (
            <span
              className={cn("flex items-center gap-x-1.5", trailingClassName)}
            >
              <span className="text-fg-subtle">·</span>
              {trailing}
            </span>
          ) : null}
        </span>
      </div>
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
