"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { ADMIN_ROLES, ROLE_SUMMARY } from "@captureflow/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { inviteAction } from "../actions";
import type { InviteState } from "../actions";
import { TextRow, keepTyped } from "../_form";
import { Notice } from "../_ui";

const EMPTY: InviteState = { error: null, link: null, sent: false };

function InviteForm() {
  const [state, formAction, pending] = useActionState(inviteAction, EMPTY);

  return (
    <form action={formAction} ref={keepTyped} className="flex flex-col gap-5">
      <TextRow
        name="email"
        label="Email"
        type="email"
        placeholder="person@example.com"
        autoFocus
      />
      <FieldSet className="gap-2">
        <FieldLegend variant="label" className="mb-0">
          Role
        </FieldLegend>
        <RadioGroup
          name="role"
          defaultValue="viewer"
          className="flex flex-col gap-2"
        >
          {ADMIN_ROLES.map((role) => (
            <Field key={role} orientation="horizontal">
              <RadioGroupItem value={role} id={`invite-role-${role}`} />
              <FieldContent>
                <FieldLabel
                  htmlFor={`invite-role-${role}`}
                  className="capitalize"
                >
                  {role}
                </FieldLabel>
                <FieldDescription>{ROLE_SUMMARY[role]}</FieldDescription>
              </FieldContent>
            </Field>
          ))}
        </RadioGroup>
      </FieldSet>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.sent && <Notice>Invite emailed. It expires in 7 days.</Notice>}
      {state.link && (
        <Notice>
          The invite email couldn&apos;t be sent, so send this link yourself. It
          expires in 7 days and works once.
          <br />
          <code className="text-fg mt-2 inline-block text-xs break-all select-all">
            {state.link}
          </code>
        </Notice>
      )}
      <Button type="submit" disabled={pending} className="self-end">
        {pending ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}

export function InviteDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus size={16} aria-hidden />
          Invite admin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite an admin</DialogTitle>
        </DialogHeader>
        <InviteForm />
      </DialogContent>
    </Dialog>
  );
}
