"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import { ADMIN_ROLES, ROLE_SUMMARY } from "@captureflow/admin";
import { inviteAction } from "../actions";
import type { InviteState } from "../actions";
import { TextRow, keepTyped } from "../_form";
import { RoleSelect } from "../_select";
import { Notice } from "../_ui";

const EMPTY: InviteState = { error: null, link: null, sent: false };

export function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteAction, EMPTY);

  return (
    <form action={formAction} ref={keepTyped} className="flex flex-col gap-4">
      <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto]">
        <TextRow
          name="email"
          label="Email"
          type="email"
          placeholder="person@example.com"
        />
        <RoleSelect
          name="role"
          label="Role"
          defaultRole="viewer"
          roles={ADMIN_ROLES}
        />
      </div>
      <ul className="text-fg-subtle flex flex-col gap-1 text-xs">
        {ADMIN_ROLES.map((role) => (
          <li key={role}>
            <span className="text-fg-muted font-medium">{role}</span> —{" "}
            {ROLE_SUMMARY[role]}
          </li>
        ))}
      </ul>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.sent && <Notice>Invite emailed. It expires in 7 days.</Notice>}
      {state.link && (
        <Notice>
          Email is not configured on this deployment, so send this link
          yourself. It expires in 7 days and works once.
          <br />
          <code className="text-fg mt-2 inline-block text-xs break-all select-all">
            {state.link}
          </code>
        </Notice>
      )}
      <Button
        type="submit"
        variant="primary"
        isDisabled={pending}
        className="w-fit"
      >
        {pending ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}
