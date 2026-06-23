'use client';

import { useRef, type ReactNode } from 'react';
import { ChevronsUpDown, Check, LayoutGrid } from 'lucide-react';
import type { WorkspaceMembership } from '@captureflow/quota';
import {
  SmoothDropdownMenu,
  SmoothDropdownMenuContent,
  SmoothDropdownMenuItem,
  SmoothDropdownMenuTrigger,
} from '@captureflow/ui';
import { switchWorkspaceAction } from './switch-workspace-action';

// Workspace switcher card with an optional invite affordance. When the
// caller passes an `inviteSlot` it renders as a bottom section; otherwise
// the card collapses to just the switcher.

type Props = {
  currentWorkspaceId: string;
  memberships: WorkspaceMembership[];
  inviteSlot?: ReactNode;
};

export function WorkspaceSwitcher({
  currentWorkspaceId,
  memberships,
  inviteSlot,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const current =
    memberships.find((m) => m.workspace_id === currentWorkspaceId) ??
    memberships[0];
  if (!current) return null;

  const choose = (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId) return;
    if (!formRef.current) return;
    const input = formRef.current.querySelector<HTMLInputElement>(
      'input[name=workspaceId]'
    );
    if (!input) return;
    input.value = workspaceId;
    formRef.current.requestSubmit();
  };

  return (
    <div className="overflow-hidden rounded-md border border-line bg-neutral-900/60">
      <SmoothDropdownMenu>
        <SmoothDropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-2.5 py-2 text-sm text-fg transition-colors hover:bg-overlay focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-ring"
            aria-label="Switch workspace"
          >
            <LayoutGrid className="h-4 w-4 shrink-0 text-neutral-400" />
            <span className="min-w-0 flex-1 truncate text-left">
              {current.workspace_name}
            </span>
            <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
          </button>
        </SmoothDropdownMenuTrigger>
        <SmoothDropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[14rem] p-1"
        >
          {memberships.map((m) => {
            const active = m.workspace_id === currentWorkspaceId;
            return (
              <SmoothDropdownMenuItem
                key={m.workspace_id}
                onSelect={(e) => {
                  e.preventDefault();
                  choose(m.workspace_id);
                }}
                className="flex items-start gap-3 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-neutral-100">
                    {m.workspace_name}
                  </div>
                  <div className="truncate text-xs text-neutral-500">
                    {m.role === 'owner' ? 'You own this' : 'You joined'}
                  </div>
                </div>
                {active && (
                  <Check className="mt-1 h-4 w-4 shrink-0 text-neutral-200" />
                )}
              </SmoothDropdownMenuItem>
            );
          })}
        </SmoothDropdownMenuContent>
      </SmoothDropdownMenu>

      {inviteSlot ? (
        <div className="border-t border-line">{inviteSlot}</div>
      ) : null}

      {/* Hidden form is the real submission target; the buttons above
          just set workspaceId and call requestSubmit. */}
      <form ref={formRef} action={switchWorkspaceAction} className="hidden">
        <input type="hidden" name="workspaceId" value="" />
      </form>
    </div>
  );
}
