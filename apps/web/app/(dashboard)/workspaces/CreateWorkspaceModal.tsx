"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { Alert, Button, Input, Modal, Typography } from "@heroui/react";
import { WORKSPACE_NAME_MAX } from "@/lib/workspace-name";
import { createWorkspaceAction } from "./actions";

export function CreateWorkspaceModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    setOpen(false);
    setName("");
    setError(null);
  };

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const form = new FormData();
      form.set("name", name);
      const res = await createWorkspaceAction({ error: null, ok: null }, form);
      if (res.error) setError(res.error);
      else close();
    });
  };

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
                  You own it and can invite teammates. It becomes your default,
                  so your next recordings and screenshots save there.
                </Typography.Paragraph>
                <form
                  className="mt-2 flex flex-col gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!isPending && name.trim()) submit();
                  }}
                >
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
                  isDisabled={isPending || !name.trim()}
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
