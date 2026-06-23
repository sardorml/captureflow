'use client';

import { useActionState, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { updateWorkspaceNameAction } from './actions';

type FormState = { error: string | null; ok: string | null };
const INITIAL: FormState = { error: null, ok: null };

export function WorkspaceNameForm({ initialName }: { initialName: string }) {
  const [state, formAction, pending] = useActionState(
    updateWorkspaceNameAction,
    INITIAL
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
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6"
    >
      <div className="flex-1">
        <label
          htmlFor="workspace-name"
          className="block text-sm font-medium text-neutral-200"
        >
          Workspace name
        </label>
        <p className="mt-1 text-xs text-neutral-500">
          The name that appears in the switcher, members page, and share
          previews.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col items-stretch gap-2">
        <input
          id="workspace-name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          required
          className="rounded-md border border-line bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <div className="flex items-center justify-end gap-3">
          {state.error && (
            <span className="text-xs text-red-400">{state.error}</span>
          )}
          {showSaved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-300">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
          <button
            type="submit"
            disabled={pending || !dirty}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </form>
  );
}
