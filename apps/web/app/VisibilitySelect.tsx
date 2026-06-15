'use client';

import { Globe, Lock, Users } from 'lucide-react';

// Three-state visibility picker shared by the shares + snaps dashboard
// rows. Renders the matching icon for the currently-selected value
// alongside a native <select> so the dropdown chrome stays consistent
// with the rest of the row's controls. The select is the source of
// truth; the icon is purely decorative.

export type Visibility = 'public' | 'workspace' | 'private';

type Props = {
  value: Visibility;
  disabled?: boolean;
  onChange: (next: Visibility) => void;
  // When false, the workspace bans public links — the option is
  // dropped from the menu so the owner can't accidentally re-expose
  // existing rows. Server actions still enforce the policy, this is
  // just the UI affordance.
  allowPublic?: boolean;
};

function Icon({ value, className }: { value: Visibility; className?: string }) {
  if (value === 'public') return <Globe className={className} />;
  if (value === 'workspace') return <Users className={className} />;
  return <Lock className={className} />;
}

export function VisibilitySelect({
  value,
  disabled,
  onChange,
  allowPublic = true,
}: Props) {
  // Hide the public option when the workspace bans it. A row that's
  // already public (legacy bytes from before the policy flip) stays
  // selectable so the owner can still see + flip it to workspace.
  const showPublic = allowPublic || value === 'public';
  return (
    <label
      className={
        'relative inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 pl-2 pr-1 py-1 text-xs text-neutral-300 transition-colors hover:border-neutral-700 hover:text-neutral-100 ' +
        (disabled ? 'opacity-60' : '')
      }
    >
      <Icon value={value} className="h-3.5 w-3.5" />
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Visibility)}
        className="cursor-pointer appearance-none bg-transparent pr-4 text-xs text-neutral-200 outline-none [&>option]:bg-neutral-900"
        aria-label="Visibility"
      >
        {showPublic && <option value="public">Public</option>}
        <option value="workspace">Workspace</option>
        <option value="private">Private</option>
      </select>
    </label>
  );
}
