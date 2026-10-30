import Link from "next/link";
import { isSelfHosted, listMembers } from "@captureflow/quota";
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { AppIcon } from "@/components/brand-mark";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceSeatContext, paidSeatsOf } from "@/lib/billing/seats";
import { SidebarNav } from "./SidebarNav";
import { SidebarRecordItem } from "./SidebarRecordItem";
import { SidebarUpgradeCard } from "./SidebarUpgradeCard";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function Sidebar({
  collapsible = "icon",
}: {
  collapsible?: "icon" | "none";
}) {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const userId = session.user.id;
  const current = await resolveCurrentWorkspace(
    userId,
    session.user.name ?? null,
  );

  const [members, seat] = env?.DB
    ? await Promise.all([
        listMembers(env.DB, current.workspace.id),
        getWorkspaceSeatContext(current.workspace),
      ])
    : [[], null];
  const isOwner = current.role === "owner";
  const selfHosted = isSelfHosted(env);
  const paidSeats = paidSeatsOf(seat);

  return (
    <SidebarRoot
      collapsible={collapsible}
      className={collapsible === "none" ? "h-full w-full" : undefined}
    >
      <SplitLoaded name="sidebar" />
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="CaptureFlow">
              <Link href="/dashboard">
                <AppIcon size={16} />
                <span className="text-base font-semibold">CaptureFlow</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <WorkspaceSwitcher
          currentWorkspaceId={current.workspace.id}
          memberships={current.memberships}
          memberCount={members.length}
          canInvite={isOwner}
          paidSeats={paidSeats}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav isOwner={isOwner} selfHosted={selfHosted} />
      </SidebarContent>

      <SidebarFooter>
        {isOwner && seat?.offer ? (
          <div className="group-data-[collapsible=icon]:hidden">
            <SidebarUpgradeCard
              email={session.user.email}
              userId={userId}
              seat={seat.offer}
            />
          </div>
        ) : (
          <SidebarRecordItem />
        )}
      </SidebarFooter>
      {collapsible === "icon" && <SidebarRail />}
    </SidebarRoot>
  );
}
