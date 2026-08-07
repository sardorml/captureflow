import type { ReactElement, ReactNode } from "react";
import { PostedBy } from "./posted-by";
import { timeAgo } from "./time";
import { BrandMark } from "@/components/brand-mark";

export type ScreenshotNavbarProps = {
  brandLabel?: string;
  brandHref?: string;
  title: string;
  createdAt: number;
  postedByName?: string | null;
  postedByEmail?: string | null;
  right?: ReactNode;
  className?: string;
};

export function ScreenshotNavbar({
  brandLabel = "CaptureFlow",
  brandHref = "/",
  title,
  createdAt,
  postedByName = null,
  postedByEmail = null,
  right,
  className = "",
}: ScreenshotNavbarProps): ReactElement {
  const showPostedBy = postedByName !== null || postedByEmail !== null;
  return (
    <header
      className={`flex items-center gap-4 border-b border-line bg-canvas-2 px-6 py-3 ${className}`}
    >
      <a
        href={brandHref}
        className="group flex h-10 w-10 shrink-0 items-center justify-center text-fg transition-opacity hover:opacity-80"
        aria-label={brandLabel}
      >
        <BrandMark size={28} />
      </a>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-fg-strong">
          {title}
        </h1>
        <p className="text-xs text-fg-subtle">{timeAgo(createdAt)}</p>
      </div>
      {right}
      {showPostedBy && <PostedBy name={postedByName} email={postedByEmail} />}
    </header>
  );
}
