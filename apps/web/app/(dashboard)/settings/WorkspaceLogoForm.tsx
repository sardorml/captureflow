"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { Avatar, Button, Spinner } from "@heroui/react";
import { initials } from "@/lib/format";
import {
  removeWorkspaceLogoAction,
  uploadWorkspaceLogoAction,
} from "./actions";
import { SettingsRow } from "./SettingsRow";

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
    <SettingsRow
      title="Workspace logo"
      description="Shown next to your workspace name. PNG, JPEG, WebP, GIF or SVG, 2 MB max."
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 rounded-full">
          {logoUrl && <Avatar.Image src={logoUrl} alt={workspaceName} />}
          <Avatar.Fallback>{initials(workspaceName)}</Avatar.Fallback>
        </Avatar>
        {/* Siblings, never nested: the HTML parser drops a <form> inside a
            <form>, which left Remove submitting the upload action instead. */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {logoUrl && (
            <form action={removeWorkspaceLogoAction}>
              <Button variant="ghost" type="submit" size="sm">
                Remove
              </Button>
            </form>
          )}
          <form action={formAction}>
            <input
              ref={fileRef}
              type="file"
              name="logo"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              className="hidden"
              onChange={submitOnChange}
            />
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
              {pending
                ? "Uploading…"
                : logoUrl
                  ? "Replace logo"
                  : "Upload logo"}
            </Button>
          </form>
        </div>
      </div>
      {state.error && (
        <span className="text-right text-xs text-danger">{state.error}</span>
      )}
    </SettingsRow>
  );
}
