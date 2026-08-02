"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { Avatar, Button, Spinner, Typography } from "@heroui/react";
import { initials } from "@/lib/format";
import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from "./actions";

type FormState = { error: string | null; ok: string | null };
const INITIAL: FormState = { error: null, ok: null };

export function WorkspaceLogoForm({
  logoUrl,
  workspaceName,
}: {
  logoUrl: string | null;
  workspaceName: string;
}) {
  const [state, formAction, pending] = useActionState(
    uploadWorkspaceLogoAction,
    INITIAL,
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const submitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    (e.currentTarget.form as HTMLFormElement).requestSubmit();
  };

  return (
    <div className="flex flex-wrap items-start justify-between gap-6">
      <div className="flex min-w-60 flex-1 flex-col gap-1">
        <Typography weight="semibold">Workspace logo</Typography>
        <Typography type="body-xs" color="muted">
          Shown next to your workspace name. PNG, JPEG, WebP, GIF, or SVG. Max 2
          MB.
        </Typography>
      </div>
      <div className="flex w-full max-w-96 items-center gap-4">
        <Avatar className="h-14 w-14 rounded-lg">
          {logoUrl && <Avatar.Image src={logoUrl} alt={workspaceName} />}
          <Avatar.Fallback>{initials(workspaceName)}</Avatar.Fallback>
        </Avatar>
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
              <Button
                variant="secondary"
                isDisabled={pending}
                onPress={() => fileRef.current?.click()}
              >
                {pending ? (
                  <Spinner size="sm" color="current" />
                ) : (
                  <Upload size={14} />
                )}
                {pending ? "Uploading…" : logoUrl ? "Replace" : "Upload logo"}
              </Button>
              {logoUrl && (
                <form action={removeWorkspaceLogoAction}>
                  <Button variant="ghost" type="submit" size="sm">
                    Remove
                  </Button>
                </form>
              )}
            </div>
          </form>
          {state.error && (
            <span className="text-right text-xs text-danger">
              {state.error}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
