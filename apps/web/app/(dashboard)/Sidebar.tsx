import Image from 'next/image';
import Link from 'next/link';
import { Video } from 'lucide-react';
import { listMembers, totalStorageForUser } from '@captureflow/quota';
import type { AvatarGroupItem } from '@captureflow/ui';
import { UserPlus } from 'lucide-react';
import { getAppWebEnv } from '@/lib/cf-env';
import { requireSession } from '@/lib/session-guard';
import { resolveCurrentWorkspace } from '@/lib/current-workspace';
import { getEffectiveStorageLimit } from '@/lib/user-quota';
import { StorageUsage } from '../StorageUsage';
import { InviteModal } from './InviteModal';
import { SidebarNav } from './SidebarNav';
import { WorkspaceMembersStack } from './WorkspaceMembersStack';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';

// Left rail for the dashboard. Server component so the workspace +
// storage lookups (D1 round trips) happen in one render pass.
//
// Layout: brand → workspace switcher → primary nav → spacer → storage
// usage → record CTA pinned to the bottom-left. User profile lives in
// the TopBar now.

export async function Sidebar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  // Storage is workspace-owner-scoped: the pill sums every share +
  // snap in any workspace the user owns (their personal one + any
  // team workspaces they created), which matches the cap they're
  // paying for. Uploads other people make INTO their workspaces count
  // here; uploads they make into OTHER people's workspaces don't.
  const [current, usedBytes, limitBytes] = await Promise.all([
    resolveCurrentWorkspace(session.user.id, session.user.name ?? null),
    env?.DB ? totalStorageForUser(env.DB, session.user.id) : Promise.resolve(0),
    getEffectiveStorageLimit(session.user.id),
  ]);

  // Member roster for the avatar stack under the workspace switcher.
  // The "+" placeholder opens the existing InviteModal — owner-only.
  const members = env?.DB
    ? await listMembers(env.DB, current.workspace.id)
    : [];
  const isOwner = current.role === 'owner';
  const memberItems: AvatarGroupItem[] = members.map((m) => {
    const display = m.name?.trim() || m.email;
    return {
      key: m.user_id,
      label: display,
      initials: initialsOf(display),
      image: m.image,
    };
  });

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-line bg-canvas-2 md:flex">
      <Link
        href="/shares"
        className="flex items-center gap-2 px-5 py-5 transition-opacity hover:opacity-80"
      >
        <Image
          src="/logo.png"
          alt="CaptureFlow"
          width={28}
          height={28}
          className="rounded-full"
          priority
          unoptimized
        />
        <span className="text-xl font-semibold tracking-tight lowercase text-fg">
          captureflow
        </span>
      </Link>

      <div className="px-3 pb-4">
        <WorkspaceSwitcher
          currentWorkspaceId={current.workspace.id}
          memberships={current.memberships}
          inviteSlot={
            isOwner ? (
              <InviteModal
                trigger={
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-overlay hover:text-fg"
                  >
                    <UserPlus className="h-4 w-4 text-fg-subtle" />
                    <span>Invite teammates</span>
                  </button>
                }
              />
            ) : undefined
          }
        />
        <div className="mt-2.5 px-1">
          <WorkspaceMembersStack items={memberItems} canInvite={isOwner} />
        </div>
      </div>

      <SidebarNav isOwner={isOwner} />

      <div className="mt-auto border-t border-line px-4 py-4">
        <StorageUsage
          usedBytes={usedBytes}
          limitBytes={limitBytes}
          email={session.user.email}
        />
      </div>

      <div className="border-t border-line p-3">
        <a
          href="captureflow://record"
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-900/30 transition-colors hover:bg-blue-500"
        >
          <Video className="h-4 w-4" />
          Record a video
        </a>
      </div>
    </aside>
  );
}

function initialsOf(source: string): string {
  const trimmed = source.trim();
  if (!trimmed) return '?';
  return trimmed
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
