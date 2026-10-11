"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Description,
  Label,
  Modal,
  Radio,
  RadioGroup,
} from "@heroui/react";
import { ADMIN_ROLES, ROLE_SUMMARY } from "@captureflow/admin";
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
      <RadioGroup
        name="role"
        defaultValue="viewer"
        className="flex flex-col gap-2"
      >
        <Label>Role</Label>
        {ADMIN_ROLES.map((role) => (
          <Radio key={role} value={role} className="mt-0">
            <Radio.Content>
              <Radio.Control>
                <Radio.Indicator />
              </Radio.Control>
              <Label className="capitalize">{role}</Label>
            </Radio.Content>
            <Description>{ROLE_SUMMARY[role]}</Description>
          </Radio>
        ))}
      </RadioGroup>
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
      <Button
        type="submit"
        variant="primary"
        isDisabled={pending}
        className="self-end"
      >
        {pending ? "Sending…" : "Send invite"}
      </Button>
    </form>
  );
}

export function InviteDialog() {
  return (
    <Modal>
      <Button variant="primary">
        <Plus size={16} aria-hidden />
        Invite admin
      </Button>
      <Modal.Backdrop>
        <Modal.Container size="md">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>Invite an admin</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <InviteForm />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
