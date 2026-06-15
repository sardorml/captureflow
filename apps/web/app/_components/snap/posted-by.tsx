// "Posted by · Avatar + Name" — the right-side identity strip in the
// snap navbar. Hidden on narrow viewports to keep the top row tidy
// (the copy-link button is the higher-priority affordance on mobile).
import type { ReactElement } from 'react';
import { avatarInitial, displayName } from './display-name';

export type PostedByProps = {
  name: string | null;
  email: string | null;
  className?: string;
};

export function PostedBy({
  name,
  email,
  className = '',
}: PostedByProps): ReactElement {
  const owner = displayName(name, email);
  return (
    <div
      className={`hidden items-center gap-2 border-l border-neutral-200 pl-4 sm:flex ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-200 text-xs font-semibold text-neutral-700">
        {avatarInitial(owner)}
      </span>
      <div className="leading-tight">
        <p className="text-[11px] uppercase tracking-wider text-neutral-500">
          Posted by
        </p>
        <p className="text-sm font-medium text-neutral-800">{owner}</p>
      </div>
    </div>
  );
}
