import Link from "next/link";
import {
  countWorkspaceRecordings,
  isSelfHosted,
  listMembers,
} from "@captureflow/quota";
import type { AvatarGroupItem } from "@captureflow/ui";
import { AppIcon } from "@/components/brand-mark";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { initials as initialsOf } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceSeatContext, paidSeatsOf } from "@/lib/billing/seats";
import { SidebarNav } from "./SidebarNav";
import { SidebarPlanCard } from "./SidebarPlanCard";
import { SidebarUpgradeCard } from "./SidebarUpgradeCard";
import { WorkspaceMembersStack } from "./WorkspaceMembersStack";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function Sidebar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const userId = session.user.id;
  const current = await resolveCurrentWorkspace(
    userId,
    session.user.name ?? null,
  );

  const [members, recordingCount, seat] = env?.DB
    ? await Promise.all([
        listMembers(env.DB, current.workspace.id),
        countWorkspaceRecordings(env.DB, current.workspace.id),
        getWorkspaceSeatContext(current.workspace),
      ])
    : [[], 0, null];
  const isOwner = current.role === "owner";
  const selfHosted = isSelfHosted(env);
  const paidSeats = paidSeatsOf(seat);
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
      <SplitLoaded name="sidebar" />
      <Link href="/dashboard" className="group flex items-center gap-2 p-5">
        <AppIcon size={28} />
        <span className="text-xl font-semibold text-fg">CaptureFlow</span>
      </Link>

      <div className="px-3 pb-3">
        <WorkspaceSwitcher
          currentWorkspaceId={current.workspace.id}
          memberships={current.memberships}
          memberCount={members.length}
          recordingCount={recordingCount}
          canInvite={isOwner}
          paidSeats={paidSeats}
          footer={
            <WorkspaceMembersStack
              items={memberItems}
              canInvite={isOwner}
              paidSeats={paidSeats}
            />
          }
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav isOwner={isOwner} selfHosted={selfHosted} />
      </div>

      {/* Whoever can't upgrade sees what the workspace has instead. */}
      {seat && !selfHosted && (
        <div className="px-3 pt-3 pb-4">
          {isOwner && seat.offer ? (
            <SidebarUpgradeCard
              email={session.user.email}
              userId={userId}
              seat={seat.offer}
            />
          ) : (
            <SidebarPlanCard
              entitlement={seat.entitlement}
              seats={seat.memberCount}
              recordingCount={recordingCount}
              renewsAt={paidSeats?.periodEnd ?? null}
              isEnding={seat.subscription?.cancelled_at != null}
              canManageBilling={isOwner}
            />
          )}
        </div>
      )}
    </div>
  );
}
