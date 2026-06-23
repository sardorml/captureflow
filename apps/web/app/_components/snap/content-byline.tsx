import type { ReactElement } from 'react';

// Byline shown under a snap title: "<author> · <relative time>".
// The relative bucket is computed once on the server (RSC) — fine for
// a viewer page that visitors typically open once. The absolute
// timestamp is revealed on hover via a pure-CSS popover, so the byline
// ships no client JS.

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
    <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-sm text-neutral-400">
      {ownerName ? (
        <>
          <span className="text-neutral-300">{ownerName}</span>
          <span className="text-neutral-600">·</span>
        </>
      ) : null}
      <span className="group/time relative">
        <span className="cursor-default">{relative}</span>
        <span className="pointer-events-none absolute left-1/2 top-full z-10 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-100 opacity-0 shadow-lg ring-1 ring-line-strong transition-opacity duration-150 group-hover/time:opacity-100">
          {absolute}
        </span>
      </span>
    </p>
  );
}

function formatRelative(epochMs: number): string {
  const diff = Date.now() - epochMs;
  if (diff < 0) return 'just now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return min === 1 ? '1 minute ago' : `${min} minutes ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr === 1 ? 'about 1 hour ago' : `about ${hr} hours ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return day === 1 ? '1 day ago' : `${day} days ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return week === 1 ? '1 week ago' : `${week} weeks ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return month === 1 ? '1 month ago' : `${month} months ago`;
  const year = Math.floor(day / 365);
  return year === 1 ? '1 year ago' : `${year} years ago`;
}

function formatAbsolute(epochMs: number): string {
  return new Date(epochMs).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
