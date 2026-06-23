import type { WorkspaceMember } from '@captureflow/quota';
import { LogOut, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@captureflow/ui';
import { leaveWorkspaceAction, removeMemberAction } from './actions';

function initials(name: string, email: string): string {
  const source = name.trim() || email;
  return source
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

type Props = {
  members: WorkspaceMember[];
  // Drives the per-row action: an owner sees a remove button on every
  // non-owner row; a non-owner sees a leave button on their own row only.
  viewerUserId: string;
  viewerIsOwner: boolean;
};

export function MembersList({ members, viewerUserId, viewerIsOwner }: Props) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Members ({members.length})
      </h3>
      <ul className="mt-3 divide-y divide-white/5 overflow-hidden rounded-lg border border-line bg-neutral-900">
        {members.map((m) => {
          const isOwnerRow = m.role === 'owner';
          const isSelfRow = m.user_id === viewerUserId;
          return (
            <li
              key={m.user_id}
              className="flex items-center gap-3 px-4 py-3 text-sm"
            >
              <Avatar className="h-9 w-9">
                {m.image ? <AvatarImage src={m.image} alt="" /> : null}
                <AvatarFallback seed={m.user_id}>
                  {initials(m.name, m.email)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-neutral-100">{m.name || m.email}</p>
                <p className="truncate text-xs text-neutral-500">{m.email}</p>
              </div>
              <span
                className={
                  'rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-line-strong ' +
                  (isOwnerRow
                    ? 'bg-overlay text-neutral-100'
                    : 'bg-neutral-800 text-neutral-400')
                }
              >
                {isOwnerRow ? 'Admin' : 'Member'}
              </span>
              {viewerIsOwner && !isOwnerRow && (
                <form action={removeMemberAction}>
                  <input type="hidden" name="userId" value={m.user_id} />
                  <button
                    type="submit"
                    aria-label={`Remove ${m.name || m.email}`}
                    title="Remove from workspace"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </form>
              )}
              {!viewerIsOwner && isSelfRow && (
                <form action={leaveWorkspaceAction}>
                  <button
                    type="submit"
                    aria-label="Leave workspace"
                    title="Leave workspace"
                    className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-xs font-medium text-neutral-300 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                    Leave
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
