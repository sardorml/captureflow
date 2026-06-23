import type { ReactElement } from 'react';
import { formatRelativeLong as formatRelative } from '@/lib/format';

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

function formatAbsolute(epochMs: number): string {
  return new Date(epochMs).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
