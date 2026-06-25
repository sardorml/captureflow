import Image from "next/image";
import Link from "next/link";
import { Video } from "lucide-react";
import { UserPlus } from "lucide-react";
import { Button } from "antd";
import { listMembers, totalStorageForUser } from "@captureflow/quota";
import type { AvatarGroupItem } from "@captureflow/ui";
import { initials as initialsOf } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { StorageUsage } from "../StorageUsage";
import { InviteModal } from "./InviteModal";
import { SidebarNav } from "./SidebarNav";
import { WorkspaceMembersStack } from "./WorkspaceMembersStack";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export async function Sidebar() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  // Storage is owner-scoped: sums share + snap bytes across the user's owned
  // workspaces (uploads into others' workspaces don't count against their cap).
  const [current, usedBytes, limitBytes] = await Promise.all([
    resolveCurrentWorkspace(session.user.id, session.user.name ?? null),
    env?.DB ? totalStorageForUser(env.DB, session.user.id) : Promise.resolve(0),
    getEffectiveStorageLimit(session.user.id),
  ]);

  const members = env?.DB
    ? await listMembers(env.DB, current.workspace.id)
    : [];
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Link
        href="/shares"
        style={{ display: "flex", alignItems: "center", gap: 8, padding: 20 }}
      >
        <Image
          src="/logo.png"
          alt="CaptureFlow"
          width={28}
          height={28}
          style={{ borderRadius: "9999px" }}
          priority
          unoptimized
        />
        <span
          className="text-fg"
          style={{ fontSize: 20, fontWeight: 600, textTransform: "lowercase" }}
        >
          captureflow
        </span>
      </Link>

      <div style={{ padding: "0 12px 16px" }}>
        <WorkspaceSwitcher
          currentWorkspaceId={current.workspace.id}
          memberships={current.memberships}
          inviteSlot={
            isOwner ? (
              <InviteModal
                trigger={
                  <Button
                    type="text"
                    block
                    icon={<UserPlus size={16} />}
                    style={{ justifyContent: "flex-start" }}
                  >
                    Invite teammates
                  </Button>
                }
              />
            ) : undefined
          }
        />
        <div style={{ marginTop: 10, padding: "0 4px" }}>
          <WorkspaceMembersStack items={memberItems} canInvite={isOwner} />
        </div>
      </div>

      <SidebarNav isOwner={isOwner} />

      <div style={{ marginTop: "auto", padding: 16 }}>
        <StorageUsage
          usedBytes={usedBytes}
          limitBytes={limitBytes}
          email={session.user.email}
        />
      </div>

      <div style={{ padding: 12 }}>
        <Button
          type="primary"
          block
          icon={<Video size={16} />}
          href="captureflow://record"
        >
          Record a video
        </Button>
      </div>
    </div>
  );
}
