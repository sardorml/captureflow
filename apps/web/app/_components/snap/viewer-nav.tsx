"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import { Check, Download, Link2 } from "lucide-react";

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
          <span className="text-neutral-100">{productName}</span>
          {label ? (
            <>
              <span aria-hidden className="text-neutral-700">
                |
              </span>
              <span className="text-neutral-400">{label}</span>
            </>
          ) : null}
        </span>
      </a>
      <div className="flex items-center gap-3">
        {typeof viewCount === "number" ? (
          <span className="text-sm tabular-nums text-neutral-400">
            {viewCount.toLocaleString()} {viewCount === 1 ? "view" : "views"}
          </span>
        ) : null}
        {actions ? (
          actions
        ) : (
          <>
            {downloadUrl ? (
              <a
                href={downloadUrl}
                download={downloadName ?? true}
                aria-label="Download"
                title="Download"
                className="flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-overlay text-sm font-medium text-neutral-300 transition-colors hover:bg-overlay-strong hover:text-fg-strong sm:w-auto sm:px-3"
              >
                <Download className="size-[18px]" />
                <span className="hidden sm:inline">Download</span>
              </a>
            ) : null}
            <button
              type="button"
              onClick={handleCopy}
              aria-label={copied ? "Link copied" : "Copy link"}
              title={copied ? "Link copied" : "Copy link"}
              className={`flex h-9 w-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-colors sm:w-auto sm:px-3 ${
                copied
                  ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-overlay text-neutral-300 hover:bg-overlay-strong hover:text-fg-strong"
              }`}
            >
              {copied ? (
                <Check className="size-[18px]" />
              ) : (
                <Link2 className="size-[18px]" />
              )}
              <span className="hidden sm:inline">
                {copied ? "Copied" : "Copy link"}
              </span>
            </button>
          </>
        )}
        {themeToggle}
        {userMenu ? (
          userMenu
        ) : viewer ? (
          <span
            title={viewer.name?.trim() || viewer.email}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-xs font-semibold text-neutral-200 ring-1 ring-line-strong"
          >
            {initials(viewer)}
          </span>
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
