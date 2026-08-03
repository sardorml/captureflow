"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button, Input, Spinner, Typography } from "@heroui/react";
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
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex min-w-60 flex-1 flex-col gap-1">
          <Typography weight="semibold">Workspace name</Typography>
          <Typography type="body-xs" color="muted">
            The name that appears in the switcher, members page, and share
            previews.
          </Typography>
        </div>
        <div className="flex w-full max-w-96 flex-col gap-2">
          <Input
            id="workspace-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
          />
          <div className="flex items-center justify-end gap-3">
            {state.error && (
              <span className="text-xs text-danger">{state.error}</span>
            )}
            {showSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <Check size={14} /> Saved
              </span>
            )}
            <Button variant="primary" type="submit" isDisabled={!dirty}>
              {pending && <Spinner size="sm" color="current" />}
              Save
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
