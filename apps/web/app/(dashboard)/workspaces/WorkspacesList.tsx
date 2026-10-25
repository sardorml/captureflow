"use client";

import { useState, useTransition } from "react";
import { Check, Settings2, UserPlus } from "lucide-react";
import { Avatar, Button, Chip, Tabs } from "@heroui/react";
import type { WorkspaceKind, WorkspaceRole } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { resolveWorkspaceCard, workspaceCardStyle } from "@/lib/workspace-card";
import { InviteModal } from "../InviteModal";
import { switchWorkspaceAction } from "../switch-workspace-action";
import { ManageWorkspaceModal } from "./ManageWorkspaceModal";

export type WorkspaceCardData = {
  id: string;
  name: string;
  kind: WorkspaceKind;
  role: WorkspaceRole;
  logoUrl: string | null;
  cardBg: string | null;
  memberCount: number;
  recordingCount: number;
  isDefault: boolean;
};

type Filter = "all" | "owned" | "joined";

const TAB_CLASS =
  "isolate h-8 justify-center gap-1.5 px-3.5 text-sm font-medium whitespace-nowrap text-fg-muted data-[selected=true]:text-fg";

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

export function WorkspacesList({
  workspaces,
}: {
  workspaces: WorkspaceCardData[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [managingId, setManagingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);
  const owned = workspaces.filter((w) => w.role === "owner");
  const joined = workspaces.filter((w) => w.role !== "owner");
  const shown =
    filter === "owned" ? owned : filter === "joined" ? joined : workspaces;
  // Looked up by id each render so a modal left open shows what the page
  // refreshed to after a save.
  const managing = workspaces.find((w) => w.id === managingId) ?? null;
  const inviting = workspaces.find((w) => w.id === invitingId) ?? null;

  return (
    <div className="mt-6 flex flex-col gap-5">
      <Tabs
        selectedKey={filter}
        onSelectionChange={(key) => setFilter(key as Filter)}
        aria-label="Which workspaces to show"
      >
        <Tabs.ListContainer className="w-fit rounded-xl bg-tint p-1">
          <Tabs.List className="flex gap-0 p-0">
            <Tabs.Tab id="all" className={TAB_CLASS}>
              <Tabs.Indicator className="rounded-lg bg-panel shadow-sm" />
              All
              <Count n={workspaces.length} />
            </Tabs.Tab>
            <Tabs.Tab id="owned" className={TAB_CLASS}>
              <Tabs.Indicator className="rounded-lg bg-panel shadow-sm" />
              My workspaces
              <Count n={owned.length} />
            </Tabs.Tab>
            <Tabs.Tab id="joined" className={TAB_CLASS}>
              <Tabs.Indicator className="rounded-lg bg-panel shadow-sm" />
              Joined
              <Count n={joined.length} />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {shown.length === 0 ? (
        <p className="py-10 text-center text-sm text-fg-muted">
          {filter === "joined"
            ? "You haven't joined anyone else's workspace yet."
            : "Nothing here yet."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((workspace) => (
            <li key={workspace.id}>
              <WorkspaceCard
                workspace={workspace}
                onManage={() => setManagingId(workspace.id)}
                onInvite={() => setInvitingId(workspace.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {managing && (
        <ManageWorkspaceModal
          workspace={managing}
          isOpen
          onOpenChange={(open) => {
            if (!open) setManagingId(null);
          }}
          onInvite={() => {
            setManagingId(null);
            setInvitingId(managing.id);
          }}
        />
      )}
      <InviteModal
        isOpen={inviting !== null}
        onOpenChange={(open) => {
          if (!open) setInvitingId(null);
        }}
        workspaceId={inviting?.id}
        workspaceName={inviting?.name}
      />
    </div>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-tint-strong px-2 py-0.5 text-xs font-medium text-fg tabular-nums">
      {n}
    </span>
  );
}

function WorkspaceCard({
  workspace,
  onManage,
  onInvite,
}: {
  workspace: WorkspaceCardData;
  onManage: () => void;
  onInvite: () => void;
}) {
  const background = resolveWorkspaceCard(workspace.cardBg, workspace.id);
  const isOwner = workspace.role === "owner";
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-panel shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.05)] dark:bg-panel-2 dark:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)]">
      <div
        className="h-16"
        style={workspaceCardStyle(background)}
        aria-hidden="true"
      />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <Avatar className="-mt-11 size-12 shrink-0 rounded-full ring-4 ring-panel dark:ring-panel-2">
            {workspace.logoUrl && (
              <Avatar.Image src={workspace.logoUrl} alt="" />
            )}
            <Avatar.Fallback>{initials(workspace.name)}</Avatar.Fallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-fg">{workspace.name}</p>
            <p className="mt-0.5 text-xs text-fg-muted">
              {workspace.kind === "personal" ? "Personal" : "Team"} &middot;{" "}
              {isOwner ? "You own this" : "You joined"}
            </p>
          </div>
          {workspace.isDefault && (
            <Chip size="sm" color="accent">
              Default
            </Chip>
          )}
        </div>
        <p className="text-sm text-fg-muted">
          {plural(workspace.memberCount, "member")} &middot;{" "}
          {plural(workspace.recordingCount, "recording")}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
          {workspace.isDefault ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
              <Check size={14} className="text-accent" />
              New captures save here
            </span>
          ) : (
            <MakeDefaultButton workspaceId={workspace.id} />
          )}
          {isOwner && (
            <span className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Invite to ${workspace.name}`}
                onPress={onInvite}
              >
                <UserPlus size={14} />
                Invite
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Manage ${workspace.name}`}
                onPress={onManage}
              >
                <Settings2 size={14} />
                Manage
              </Button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MakeDefaultButton({ workspaceId }: { workspaceId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="sm"
      variant="secondary"
      isDisabled={pending}
      onPress={() =>
        startTransition(async () => {
          const form = new FormData();
          form.set("workspaceId", workspaceId);
          await switchWorkspaceAction(form);
        })
      }
    >
      {pending ? "Switching…" : "Make default"}
    </Button>
  );
}
