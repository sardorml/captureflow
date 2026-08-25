import Link from "next/link";
import {
  countWorkspaceItems,
  listMembers,
  totalStorageForUser,
} from "@captureflow/quota";
import type { AvatarGroupItem } from "@captureflow/ui";
import { BrandMark } from "@/components/brand-mark";
import { RecordButton } from "./RecordButton";
import { initials as initialsOf } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { StorageUsage } from "../StorageUsage";
import { SidebarNav } from "./SidebarNav";
import { WorkspaceMembersStack } from "./WorkspaceMembersStack";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function Sidebar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  // Storage is owner-scoped: sums recording + screenshot bytes across the user's owned
  // workspaces (uploads into others' workspaces don't count against their cap).
  const [current, usedBytes, limitBytes] = await Promise.all([
    resolveCurrentWorkspace(session.user.id, session.user.name ?? null),
    env?.DB ? totalStorageForUser(env.DB, session.user.id) : Promise.resolve(0),
    getEffectiveStorageLimit(session.user.id),
  ]);

  const [members, itemCounts] = env?.DB
    ? await Promise.all([
        listMembers(env.DB, current.workspace.id),
        countWorkspaceItems(env.DB, current.workspace.id),
      ])
    : [[], { recordings: 0, screenshots: 0 }];
  const isOwner = current.role === "owner";
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
    <div className="flex h-full flex-col">
      <Link href="/recordings" className="group flex items-center gap-2 p-5">
        <BrandMark size={28} className="text-fg" />
        <span className="text-xl font-semibold text-fg">CaptureFlow</span>
      </Link>

      <div className="px-3 pb-4">
        <WorkspaceSwitcher
          currentWorkspaceId={current.workspace.id}
          memberships={current.memberships}
          memberCount={members.length}
          recordingCount={itemCounts.recordings}
          screenshotCount={itemCounts.screenshots}
          canInvite={isOwner}
        />
        <div className="mt-2.5 px-1">
          <WorkspaceMembersStack items={memberItems} canInvite={isOwner} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav isOwner={isOwner} />
      </div>

      {/* Same 12px inset as the record button below, so the two line up. */}
      <div className="px-3 pt-3">
        <StorageUsage
          usedBytes={usedBytes}
          limitBytes={limitBytes}
          email={session.user.email}
          userId={session.user.id}
        />
      </div>

      <div className="px-3 pt-3 pb-5">
        <RecordButton label="Record a video" fullWidth />
      </div>
    </div>
  );
}
