import type { WorkspaceInviteRow } from "@captureflow/quota";
import { Clock } from "lucide-react";
import { revokeInviteAction } from "./actions";

function formatRelative(ms: number): string {
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PendingInvites({
  invites,
  canRevoke,
}: {
  invites: WorkspaceInviteRow[];
  canRevoke: boolean;
}) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
        Pending invitations ({invites.length})
      </h3>
      <ul className="mt-3 divide-y divide-white/5 overflow-hidden rounded-lg border border-line bg-neutral-900">
        {invites.map((invite) => (
          <li
            key={invite.id}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-neutral-200">{invite.email}</p>
              <p
                suppressHydrationWarning
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-neutral-500"
              >
                <Clock className="h-3 w-3" />
                Invited {formatRelative(invite.created_at)}
              </p>
            </div>
            {canRevoke && (
              <form action={revokeInviteAction}>
                <input type="hidden" name="inviteId" value={invite.id} />
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-xs text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  Revoke
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
