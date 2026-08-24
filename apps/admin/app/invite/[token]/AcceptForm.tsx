"use client";

import { MIN_PASSWORD_LENGTH } from "@captureflow/admin";
import { acceptInviteAction } from "../../actions";
import { ActionForm, TextRow } from "../../_form";

export function AcceptForm({ token }: { token: string }) {
  return (
    <ActionForm
      action={acceptInviteAction}
      submit="Create account"
      busy="Creating…"
    >
      <input type="hidden" name="token" value={token} />
      <TextRow
        name="password"
        label="Choose a password"
        type="password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        autoComplete="new-password"
        autoFocus
      />
    </ActionForm>
  );
}
