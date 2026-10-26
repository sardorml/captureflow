import Link from "next/link";
import { headers } from "next/headers";
import { Ellipsis } from "lucide-react";
import { Avatar } from "@heroui/react";
import {
  countWorkspaceRecordings,
  getActiveGrantedPlan,
  getActiveProSubscription,
  isSelfHosted,
  listMembers,
  totalStorageForUser,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import type { AvatarGroupItem } from "@captureflow/ui";
import { readThemePreferenceFromCookieHeader } from "@captureflow/ui/theme";
import { AppIcon } from "@/components/brand-mark";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { initials as initialsOf } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { SidebarNav } from "./SidebarNav";
import { SidebarUpgradeCard } from "./SidebarUpgradeCard";
import { UserMenu } from "./UserMenu";
import { WorkspaceMembersStack } from "./WorkspaceMembersStack";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function Sidebar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const userId = session.user.id;
  // Storage is owner-scoped: sums recording + screenshot bytes across the user's owned
  // workspaces (uploads into others' workspaces don't count against their cap).
  const [current, usedBytes, limitBytes, subscription, grant, userRow] =
    await Promise.all([
      resolveCurrentWorkspace(userId, session.user.name ?? null),
      env?.DB ? totalStorageForUser(env.DB, userId) : Promise.resolve(0),
      getEffectiveStorageLimit(userId),
      env?.DB ? getActiveProSubscription(env.DB, userId) : null,
      env?.DB ? getActiveGrantedPlan(env.DB, userId) : null,
      env?.DB
        ? env.DB.prepare(`SELECT image FROM users WHERE id = ?1 LIMIT 1`)
            .bind(userId)
            .first<{ image: string | null }>()
        : null,
    ]);

  const [members, recordingCount] = env?.DB
    ? await Promise.all([
        listMembers(env.DB, current.workspace.id),
        countWorkspaceRecordings(env.DB, current.workspace.id),
      ])
    : [[], 0];
  const isOwner = current.role === "owner";
  const selfHosted = isSelfHosted(env);
  const isPro = subscription?.status === "active" || grant !== null;
  const themePreference = readThemePreferenceFromCookieHeader(
    (await headers()).get("cookie"),
  );
  const displayName = session.user.name?.trim() || session.user.email;
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
        />
        <div className="mt-2.5 px-1">
          <WorkspaceMembersStack items={memberItems} canInvite={isOwner} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <SidebarNav
          isOwner={isOwner}
          selfHosted={selfHosted}
          storage={{
            usedBytes,
            limitBytes:
              limitBytes >= UNLIMITED_STORAGE_BYTES ? null : limitBytes,
          }}
        />
      </div>

      <div className="flex flex-col gap-2 px-3 pt-3 pb-3">
        {!isPro && !selfHosted && (
          <SidebarUpgradeCard email={session.user.email} userId={userId} />
        )}
        <UserMenu
          themePreference={themePreference}
          userId={userId}
          name={session.user.name ?? null}
          email={session.user.email}
          imageUrl={userRow?.image ?? null}
          selfHosted={selfHosted}
          pro={
            subscription
              ? { status: subscription.status }
              : grant
                ? { status: "granted" }
                : null
          }
          placement="top start"
          triggerClassName="w-full rounded-xl outline-none"
          trigger={
            <span className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-tint">
              <Avatar className="h-10 w-10 shrink-0">
                {userRow?.image && (
                  <Avatar.Image src={userRow.image} alt={displayName} />
                )}
                <Avatar.Fallback>{initialsOf(displayName)}</Avatar.Fallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-fg">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-fg-muted">
                  {isPro ? "Pro" : "Free"} · {session.user.email}
                </span>
              </span>
              <Ellipsis size={18} className="shrink-0 text-fg-muted" />
            </span>
          }
        />
      </div>
    </div>
  );
}
