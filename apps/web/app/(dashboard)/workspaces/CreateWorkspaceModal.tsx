"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Input, Modal, Typography } from "@heroui/react";
import { WORKSPACE_NAME_MAX } from "@/lib/workspace-name";
import { inviteMemberAction } from "../members/actions";
import { createWorkspaceAction } from "./actions";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function splitEmails(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\s,;]+/)
        .map((e) => e.trim())
        .filter(Boolean),
    ),
  ];
}

export function CreateWorkspaceModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [invites, setInvites] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setName("");
    setInvites("");
    setError(null);
  };

  // The workspace is created first, then each invite goes to it by id; a
  // failed invite leaves the workspace in place and names who didn't get one.
  const submit = () => {
    setError(null);
    const emails = splitEmails(invites);
    const invalid = emails.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length > 0) {
      setError(`Not a valid email: ${invalid.join(", ")}`);
      return;
    }
    startTransition(async () => {
      const form = new FormData();
      form.set("name", name);
      const res = await createWorkspaceAction({ error: null, ok: null }, form);
      if (res.error || !res.ok) {
        setError(res.error ?? "Couldn’t create the workspace — try again");
        return;
      }
      const failed: string[] = [];
      for (const email of emails) {
        const fd = new FormData();
        fd.set("email", email);
        fd.set("workspaceId", res.ok);
        const sent = await inviteMemberAction({ error: null, ok: null }, fd);
        if (sent.error) failed.push(`${email}: ${sent.error}`);
      }
      if (failed.length > 0) {
        setName("");
        setInvites("");
        setError(
          `Workspace created. Some invites didn’t go out — ${failed.join("; ")}. You can retry from its card.`,
        );
        return;
      }
      close();
    });
  };

  const canSubmit = !isPending && name.trim().length > 0;

  return (
    <>
      <Button variant="primary" onPress={() => setOpen(true)}>
        <Plus size={16} />
        New workspace
      </Button>
      <Modal
        isOpen={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>Create a workspace</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <Typography.Paragraph color="muted">
                  You own it. Your default stays as it is; use &ldquo;Make
                  default&rdquo; on the new card when you want captures to save
                  there.
                </Typography.Paragraph>
                <form
                  className="mt-2 flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (canSubmit) submit();
                  }}
                >
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="new-workspace-name"
                      className="text-sm font-medium text-fg"
                    >
                      Workspace name
                    </label>
                    <Input
                      id="new-workspace-name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={WORKSPACE_NAME_MAX}
                      placeholder="Design team"
                      autoFocus
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="new-workspace-invites"
                      className="text-sm font-medium text-fg"
                    >
                      Invite teammates{" "}
                      <span className="font-normal text-fg-muted">
                        (optional)
                      </span>
                    </label>
                    <Input
                      id="new-workspace-invites"
                      name="invites"
                      value={invites}
                      onChange={(e) => setInvites(e.target.value)}
                      placeholder="ana@example.com, sam@example.com"
                    />
                    <Typography type="body-xs" color="muted">
                      Separate emails with a space or comma. Each gets a link
                      that expires in 7 days.
                    </Typography>
                  </div>
                </form>
                {error && (
                  <Alert status="danger" className="mt-3">
                    <Alert.Content>
                      <Alert.Title>{error}</Alert.Title>
                    </Alert.Content>
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer className="flex justify-end gap-2">
                <Button variant="secondary" onPress={close}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onPress={submit}
                  isDisabled={!canSubmit}
                >
                  {isPending ? "Creating…" : "Create workspace"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
