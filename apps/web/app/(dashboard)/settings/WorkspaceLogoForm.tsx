'use client';

import { useActionState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from './actions';

type FormState = { error: string | null; ok: string | null };
const INITIAL: FormState = { error: null, ok: null };

function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

export function WorkspaceLogoForm({
  logoUrl,
  workspaceName,
}: {
  logoUrl: string | null;
  workspaceName: string;
}) {
  const [state, formAction, pending] = useActionState(
    uploadWorkspaceLogoAction,
    INITIAL
  );
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-submit on file pick so there's no separate confirm step.
  const submitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    (e.currentTarget.form as HTMLFormElement).requestSubmit();
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
      <div className="flex-1">
        <p className="text-sm font-medium text-neutral-200">Workspace logo</p>
        <p className="mt-1 text-xs text-neutral-500">
          Shown next to your workspace name. PNG, JPEG, WebP, GIF, or SVG. Max 2
          MB.
        </p>
      </div>
      <div className="flex w-full max-w-sm items-center gap-4">
        {logoUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={logoUrl}
            alt={`${workspaceName} logo`}
            className="h-14 w-14 shrink-0 rounded-lg object-cover ring-1 ring-line-strong"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-base font-semibold text-neutral-300 ring-1 ring-line-strong">
            {initials(workspaceName)}
          </span>
        )}
        <div className="flex flex-1 flex-col items-stretch gap-2">
          <form action={formAction}>
            <input
              ref={fileRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={submitOnChange}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={pending}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-canvas-2 px-3 py-1.5 text-sm text-fg transition-colors hover:border-line-strong hover:bg-overlay hover:text-fg-strong disabled:opacity-50"
              >
                <Upload className="h-3.5 w-3.5" />
                {pending ? 'Uploading…' : logoUrl ? 'Replace' : 'Upload logo'}
              </button>
              {logoUrl && (
                <form action={removeWorkspaceLogoAction}>
                  <button
                    type="submit"
                    className="rounded-md px-2 py-1.5 text-xs text-fg-muted transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    Remove
                  </button>
                </form>
              )}
            </div>
          </form>
          {state.error && (
            <p className="text-right text-xs text-red-400">{state.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
