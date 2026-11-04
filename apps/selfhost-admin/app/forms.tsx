"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Input, Select } from "./_ui";
import { createWorkspaceAction, inviteAction } from "./actions";

export function CreateWorkspaceForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createWorkspaceAction, {
    error: null,
    id: null,
  });
  useEffect(() => {
    if (state.id) router.push(`/workspaces/${state.id}`);
  }, [state.id, router]);
  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Input
          name="name"
          required
          maxLength={80}
          placeholder="Workspace name"
          aria-label="Workspace name"
          className="w-full max-w-sm"
        />
        <Button type="submit" disabled={pending || !!state.id}>
          {pending || state.id ? "Creating…" : "Create workspace"}
        </Button>
      </div>
      {state.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(inviteAction, {
    error: null,
    email: null,
    link: null,
  });
  const [copied, setCopied] = useState(false);
  return (
    <form
      action={(formData) => {
        setCopied(false);
        action(formData);
      }}
      className="flex flex-col gap-3"
    >
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex flex-wrap gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          aria-label="Email address"
          className="w-full max-w-sm"
        />
        <Select name="role" defaultValue="member" aria-label="Role">
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Invite"}
        </Button>
      </div>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.link && (
        <div className="flex flex-col gap-2 rounded-xl bg-tint p-4">
          <p className="text-sm text-fg">
            Send this link to {state.email}. It works for 7 days, and they need
            to sign up or log in with that address.
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              readOnly
              value={state.link}
              aria-label="Invite link"
              className="flex-1"
            />
            <Button
              variant="secondary"
              onClick={async () => {
                await navigator.clipboard.writeText(state.link ?? "");
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}
