'use client';

import { useFormStatus } from 'react-dom';
import { type ReactNode } from 'react';

// Shared submit button for the workspace-settings policy cards
// (AccessPolicy + MemberUploadsPolicy). Reads the parent form's
// `useFormStatus()` so the clicked card can render an inline pending
// state — the radio dot swaps for a spinner and the border tints —
// while the server action runs. Both policies use identical chrome,
// so the only divergence is the card's `icon` + `title` + `body`.

type Props = {
  active: boolean;
  icon: ReactNode;
  title: string;
  body: string;
};

export function PolicyCardButton({ active, icon, title, body }: Props) {
  const { pending } = useFormStatus();
  const showPending = pending;
  const showActive = active && !pending;
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={
        'group relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors disabled:cursor-progress ' +
        (showPending
          ? 'border-blue-500/40 bg-neutral-800/60'
          : showActive
          ? 'border-line-strong bg-neutral-800'
          : 'border-line bg-neutral-950/60 hover:border-line-strong hover:bg-neutral-800/60')
      }
    >
      <span
        className={
          'mt-0.5 shrink-0 transition-colors ' +
          (showActive ? 'text-fg dark:text-white' : 'text-neutral-400')
        }
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          {title}
          {showPending && (
            <span className="text-[11px] font-normal text-blue-300">
              Updating…
            </span>
          )}
        </p>
        <p className="mt-1 text-xs text-neutral-400">{body}</p>
      </div>
      <span
        aria-hidden
        className={
          'mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ' +
          (showPending
            ? 'border-blue-500 bg-neutral-900'
            : showActive
            ? 'border-fg bg-fg'
            : 'border-neutral-600 bg-neutral-950')
        }
      >
        {showPending ? (
          <span className="h-2.5 w-2.5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        ) : showActive ? (
          <span className="h-1.5 w-1.5 rounded-full bg-canvas" />
        ) : null}
      </span>
    </button>
  );
}
