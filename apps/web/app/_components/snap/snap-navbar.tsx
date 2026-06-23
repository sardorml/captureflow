import type { ReactElement, ReactNode } from "react";
import { PostedBy } from "./posted-by";
import { timeAgo } from "./time";

export type SnapNavbarProps = {
  brandLabel?: string;
  brandHref?: string;
  title: string;
  createdAt: number;
  postedByName?: string | null;
  postedByEmail?: string | null;
  right?: ReactNode;
  className?: string;
};

export function SnapNavbar({
  brandLabel = "CaptureFlow",
  brandHref = "/",
  title,
  createdAt,
  postedByName = null,
  postedByEmail = null,
  right,
  className = "",
}: SnapNavbarProps): ReactElement {
  const showPostedBy = postedByName !== null || postedByEmail !== null;
  return (
    <header
      className={`flex items-center gap-4 border-b border-neutral-200 bg-white px-6 py-3 ${className}`}
    >
      <a
        href={brandHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg transition-opacity hover:opacity-80"
        aria-label={brandLabel}
      >
        <img
          src="/logo.png"
          alt=""
          width={40}
          height={40}
          className="h-full w-full object-contain"
          draggable={false}
        />
      </a>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-neutral-900">
          {title}
        </h1>
        <p className="text-xs text-neutral-500">{timeAgo(createdAt)}</p>
      </div>
      {right}
      {showPostedBy && <PostedBy name={postedByName} email={postedByEmail} />}
    </header>
  );
}
