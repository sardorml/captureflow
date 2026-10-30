"use client";

import { useActionState, useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { updateWorkspaceNameAction } from "./actions";
import { SettingsRow } from "./SettingsRow";

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
      <SettingsRow
        title="Workspace name"
        description="The name that appears for your workspace."
      >
        <div className="flex items-center gap-2">
          <Input
            id="workspace-name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            required
            className="flex-1"
          />
          <Button type="submit" disabled={!dirty}>
            {pending && <Spinner />}
            Save
          </Button>
        </div>
        {(state.error || showSaved) && (
          <div className="flex items-center justify-end gap-3">
            {state.error && (
              <span className="text-xs text-destructive">{state.error}</span>
            )}
            {showSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-500">
                <Check size={14} /> Saved
              </span>
            )}
          </div>
        )}
      </SettingsRow>
    </form>
  );
}
