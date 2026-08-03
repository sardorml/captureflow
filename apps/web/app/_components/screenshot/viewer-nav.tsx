"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Check, Download, Link2 } from "lucide-react";
import { Avatar, Button, Tooltip, buttonVariants } from "@heroui/react";

export type ViewerNavViewer = {
  name: string | null;
  email: string;
};

export type ViewerNavProps = {
  homeUrl: string;
  productName: string;
  label?: string;
  logoSrc?: string;
  viewCount?: number;
  downloadUrl?: string;
  downloadName?: string;
  viewer?: ViewerNavViewer | null;
  userMenu?: ReactNode;
  notifications?: ReactNode;
  themeToggle?: ReactNode;
  actions?: ReactNode;
};

export function ViewerNav({
  homeUrl,
  productName,
  label,
  logoSrc = "/logo.png",
  viewCount,
  downloadUrl,
  downloadName,
  viewer,
  actions,
  userMenu,
  notifications,
  themeToggle,
}: ViewerNavProps): ReactElement {
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
    <header className="flex h-16 w-full items-center justify-between border-b border-line bg-canvas-2 px-4 sm:px-6">
      <a
        href={homeUrl}
        rel="noopener noreferrer"
        className="flex items-center gap-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt={productName}
          width={32}
          height={32}
          className="h-7 w-auto"
        />
        <span className="flex items-baseline gap-1.5 text-xl font-semibold tracking-tight lowercase">
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
      {/* One gap for the whole row, matching what the actions use internally:
          the icon buttons pad their own glyphs, so anything wider here opens a
          visible hole between two of them. */}
      <div className="flex items-center gap-2">
        {typeof viewCount === "number" ? (
          <span className="text-sm tabular-nums text-fg-muted">
            {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
          </span>
        ) : null}
        {actions ? (
          actions
        ) : (
          <>
            {downloadUrl ? (
              <Tooltip>
                <Tooltip.Trigger className="inline-flex">
                  <a
                    href={downloadUrl}
                    download={downloadName ?? true}
                    aria-label="Download"
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content>Download</Tooltip.Content>
              </Tooltip>
            ) : null}
            <Tooltip>
              <Tooltip.Trigger className="inline-flex">
                <Button
                  variant="secondary"
                  onPress={handleCopy}
                  aria-label={copied ? "Link copied" : "Copy link"}
                >
                  {copied ? <Check size={18} /> : <Link2 size={18} />}
                  <span className="hidden sm:inline">
                    {copied ? "Copied" : "Copy link"}
                  </span>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {copied ? "Link copied" : "Copy link"}
              </Tooltip.Content>
            </Tooltip>
          </>
        )}
        {notifications}
        {themeToggle}
        {userMenu ? (
          userMenu
        ) : viewer ? (
          <Tooltip>
            <Tooltip.Trigger tabIndex={0}>
              <Avatar className="h-9 w-9">
                <Avatar.Fallback>{initials(viewer)}</Avatar.Fallback>
              </Avatar>
            </Tooltip.Trigger>
            <Tooltip.Content>
              {viewer.name?.trim() || viewer.email}
            </Tooltip.Content>
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
