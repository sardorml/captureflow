"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Check, Download, Link2 } from "lucide-react";
import { Avatar, Button, Tooltip } from "antd";

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
      <div className="flex items-center gap-3">
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
              <Tooltip title="Download">
                <Button
                  href={downloadUrl}
                  download={downloadName ?? true}
                  aria-label="Download"
                  icon={<Download size={18} />}
                >
                  <span className="hidden sm:inline">Download</span>
                </Button>
              </Tooltip>
            ) : null}
            <Tooltip title={copied ? "Link copied" : "Copy link"}>
              <Button
                onClick={handleCopy}
                aria-label={copied ? "Link copied" : "Copy link"}
                icon={copied ? <Check size={18} /> : <Link2 size={18} />}
              >
                <span className="hidden sm:inline">
                  {copied ? "Copied" : "Copy link"}
                </span>
              </Button>
            </Tooltip>
          </>
        )}
        {themeToggle}
        {userMenu ? (
          userMenu
        ) : viewer ? (
          <Tooltip title={viewer.name?.trim() || viewer.email}>
            <Avatar size={36}>{initials(viewer)}</Avatar>
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
