"use client";

import { useTransition } from "react";
import { Check } from "lucide-react";
import { Avatar, Button, Chip } from "@heroui/react";
import type { WorkspaceKind, WorkspaceRole } from "@captureflow/quota";
import { initials } from "@/lib/format";
import { switchWorkspaceAction } from "../switch-workspace-action";

export type WorkspaceCardData = {
  id: string;
  name: string;
  kind: WorkspaceKind;
  role: WorkspaceRole;
  logoUrl: string | null;
  memberCount: number;
  recordingCount: number;
  isDefault: boolean;
};

const plural = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

export function WorkspacesList({
  workspaces,
}: {
  workspaces: WorkspaceCardData[];
}) {
  return (
    <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {workspaces.map((workspace) => (
        <li key={workspace.id}>
          <WorkspaceCard workspace={workspace} />
        </li>
      ))}
    </ul>
  );
}

function WorkspaceCard({ workspace }: { workspace: WorkspaceCardData }) {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl bg-panel p-5 shadow-[0_1px_3px_rgb(0_0_0/0.06),0_0_0_1px_rgb(0_0_0/0.05)] dark:bg-panel-2 dark:shadow-[0_1px_3px_rgb(0_0_0/0.3),0_0_0_1px_rgb(255_255_255/0.06)]">
      <div className="flex items-start gap-3">
        <Avatar className="size-12 shrink-0 rounded-full">
          {workspace.logoUrl && <Avatar.Image src={workspace.logoUrl} alt="" />}
          <Avatar.Fallback>{initials(workspace.name)}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-fg">{workspace.name}</p>
          <p className="mt-0.5 text-xs text-fg-muted">
            {workspace.kind === "personal" ? "Personal" : "Team"} &middot;{" "}
            {workspace.role === "owner" ? "You own this" : "You joined"}
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
      <div className="mt-auto flex items-center justify-between gap-2">
        {workspace.isDefault ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
            <Check size={14} className="text-accent" />
            New captures save here
          </span>
        ) : (
          <MakeDefaultButton workspaceId={workspace.id} />
        )}
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
