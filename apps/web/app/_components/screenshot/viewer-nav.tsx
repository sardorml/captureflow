"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Check, Download, Link2 } from "lucide-react";
import { AppIcon } from "@/components/brand-mark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppLocale, useAppMessages } from "@/components/app-i18n-provider";
import { fmt, plural } from "@/lib/i18n/format";
import { formatNumber } from "@/lib/i18n/intl";
import { cn } from "@/lib/utils";

export type ViewerNavViewer = {
  name: string | null;
  email: string;
};

export type ViewerNavProps = {
  homeUrl: string;
  productName: string;
  label?: string;
  /** Sits to the left of the brand, e.g. the workspace drawer trigger. */
  leading?: ReactNode;
  viewCount?: number;
  downloadUrl?: string;
  downloadName?: string;
  viewer?: ViewerNavViewer | null;
  userMenu?: ReactNode;
  notifications?: ReactNode;
  themeToggle?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function ViewerNav({
  homeUrl,
  productName,
  label,
  leading,
  viewCount,
  downloadUrl,
  downloadName,
  viewer,
  actions,
  userMenu,
  notifications,
  themeToggle,
  className,
}: ViewerNavProps): ReactElement {
  const m = useAppMessages();
  const { lang } = useAppLocale();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = (): void => {
    if (typeof window === "undefined") return;
    void navigator.clipboard
      .writeText(window.location.href)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  return (
    <header
      className={cn(
        "flex h-16 w-full items-center justify-between bg-canvas-2 px-4 sm:px-6",
        className,
      )}
    >
      {/* The header is justify-between over exactly two children, so anything
          left of the brand has to group with it rather than become a third. */}
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <a
          href={homeUrl}
          rel="noopener noreferrer"
          className="group flex items-center gap-2"
        >
          <AppIcon size={28} />
          <span className="flex items-baseline gap-1.5 text-xl font-semibold tracking-tight max-sm:sr-only">
            <span className="text-fg-strong">{productName}</span>
            {label ? (
              <>
                <span aria-hidden className="text-fg-subtle">
                  |
                </span>
                <span className="text-fg-muted">{label}</span>
              </>
            ) : null}
          </span>
        </a>
      </div>
      {/* One gap for the whole row, matching what the actions use internally:
          the icon buttons pad their own glyphs, so anything wider here opens a
          visible hole between two of them. */}
      <div className="flex min-w-0 items-center gap-2">
        {typeof viewCount === "number" ? (
          <span className="min-w-0 truncate text-sm tabular-nums text-fg-muted">
            {fmt(plural(m.viewer.views.count, viewCount, lang), {
              count: formatNumber(viewCount, lang),
            })}
          </span>
        ) : null}
        {actions ? (
          actions
        ) : (
          <>
            {downloadUrl ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={downloadUrl}
                    download={downloadName ?? true}
                    aria-label={m.viewer.nav.download}
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">
                      {m.viewer.nav.download}
                    </span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>{m.viewer.nav.download}</TooltipContent>
              </Tooltip>
            ) : null}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  onClick={handleCopy}
                  aria-label={
                    copied
                      ? m.library.share.linkCopied
                      : m.library.share.copyLink
                  }
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                  <span className="hidden sm:inline">
                    {copied ? m.common.copied : m.library.share.copyLink}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? m.library.share.linkCopied : m.library.share.copyLink}
              </TooltipContent>
            </Tooltip>
          </>
        )}
        {notifications}
        {themeToggle}
        {userMenu ? (
          userMenu
        ) : viewer ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="inline-flex rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback>{initials(viewer)}</AvatarFallback>
                </Avatar>
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {viewer.name?.trim() || viewer.email}
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>
    </header>
  );
}

function initials(viewer: ViewerNavViewer): string {
  const source = (viewer.name ?? "").trim() || viewer.email;
  return source
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
