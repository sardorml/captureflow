"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button, Flex, Input, Typography } from "antd";
import { updateWorkspaceNameAction } from "./actions";

type FormState = { error: string | null; ok: string | null };
const INITIAL: FormState = { error: null, ok: null };

export function WorkspaceNameForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(
    updateWorkspaceNameAction,
    INITIAL,
  );
  const [name, setName] = useState(initialName);
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!state.ok) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSaved(true);
    const id = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(id);
  }, [state.ok]);

  const dirty = name.trim() !== initialName;

  return (
    <form action={formAction}>
      <Flex gap={24} wrap align="flex-start" justify="space-between">
        <Flex vertical gap={4} flex={1} style={{ minWidth: 240 }}>
          <Typography.Text strong>Workspace name</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            The name that appears in the switcher, members page, and share
            previews.
          </Typography.Text>
        </Flex>
        <Flex vertical gap={8} style={{ width: "100%", maxWidth: 384 }}>
          <Input
            id="workspace-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
          <Flex gap={12} align="center" justify="flex-end">
            {state.error && (
              <Typography.Text type="danger" style={{ fontSize: 12 }}>
                {state.error}
              </Typography.Text>
            )}
            {showSaved && (
              <Typography.Text type="success" style={{ fontSize: 12 }}>
                <Check size={14} style={{ verticalAlign: "-2px" }} /> Saved
              </Typography.Text>
            )}
            <Button
              type="primary"
              htmlType="submit"
              loading={pending}
              disabled={!dirty}
            >
              Save
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
