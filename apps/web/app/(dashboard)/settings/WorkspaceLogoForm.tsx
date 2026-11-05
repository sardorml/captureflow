"use client";

import { useActionState, useRef } from "react";
import { Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useAppMessages } from "@/components/app-i18n-provider";
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
  const m = useAppMessages();

  const submitOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    (e.currentTarget.form as HTMLFormElement).requestSubmit();
  };

  return (
    <SettingsRow
      title={m.settings.workspace.logo.title}
      description={m.settings.workspace.logo.description}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 rounded-full">
          {logoUrl && <AvatarImage src={logoUrl} alt={workspaceName} />}
          <AvatarFallback>{initials(workspaceName)}</AvatarFallback>
        </Avatar>
        {/* Siblings, never nested: the HTML parser drops a <form> inside a
            <form>, which left Remove submitting the upload action instead. */}
        <div className="flex flex-1 items-center justify-end gap-2">
          {logoUrl && (
            <form action={removeWorkspaceLogoAction}>
              <Button variant="ghost" type="submit" size="sm">
                {m.common.remove}
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
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => fileRef.current?.click()}
            >
              {pending ? <Spinner /> : <Upload size={14} />}
              {pending
                ? m.settings.upload.uploading
                : logoUrl
                  ? m.settings.workspace.logo.replace
                  : m.settings.workspace.logo.upload}
            </Button>
          </form>
        </div>
      </div>
      {state.error && (
        <span className="text-right text-xs text-destructive">
          {state.error}
        </span>
      )}
    </SettingsRow>
  );
}
