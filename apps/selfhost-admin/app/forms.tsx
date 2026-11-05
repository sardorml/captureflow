"use client";

import { useActionState, useState } from "react";
import { Alert, Button, EmailSetupLink, Input, Select } from "./_ui";
import { inviteAction, passwordLinkAction } from "./actions";

export function CopyableLink({
  link,
  label,
  children,
}: {
  link: string;
  label: string;
  children: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-tint p-4">
      <p className="text-sm text-fg">{children}</p>
      <div className="flex flex-wrap gap-2">
        <Input readOnly value={link} aria-label={label} className="flex-1" />
        <Button
          variant="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(link);
            setCopied(true);
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}

export function InviteForm({ workspaceId }: { workspaceId: string }) {
  const [state, action, pending] = useActionState(inviteAction, {
    error: null,
    email: null,
    link: null,
  });
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <div className="flex flex-wrap gap-2">
        <Input
          name="email"
          type="email"
          required
          placeholder="name@example.com"
          aria-label="Email address"
          className="w-full max-w-sm"
        />
        <Select name="role" defaultValue="member" aria-label="Role">
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </Select>
        <Button type="submit" disabled={pending}>
          {pending ? "Inviting…" : "Invite"}
        </Button>
      </div>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.link && (
        <CopyableLink key={state.link} link={state.link} label="Invite link">
          Send this link to {state.email}. It works for 7 days, and they need to
          sign up or log in with that address.
        </CopyableLink>
      )}
    </form>
  );
}

export function PasswordLinkForm({
  userId,
  mailConfigured,
}: {
  userId: string;
  mailConfigured: boolean;
}) {
  const [state, action, pending] = useActionState(passwordLinkAction, {
    error: null,
    email: null,
    link: null,
  });
  return (
    <>
      <form action={action}>
        <input type="hidden" name="userId" value={userId} />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending
            ? "Sending…"
            : mailConfigured
              ? "Email password link"
              : "Create password link"}
        </Button>
      </form>
      {state.error && (
        <div className="w-full">
          <Alert tone="error">{state.error}</Alert>
        </div>
      )}
      {state.email && !state.link && (
        <div className="w-full">
          <Alert>
            We emailed {state.email} a link to choose a password. It works once,
            for 24 hours, and replaces any earlier link.
          </Alert>
        </div>
      )}
      {state.link && (
        <div className="w-full">
          <CopyableLink
            key={state.link}
            link={state.link}
            label="Password link"
          >
            No email was sent: email isn&rsquo;t set up on this CaptureFlow.{" "}
            <EmailSetupLink />, or send this link to {state.email} yourself. It
            works once, for 24 hours, and replaces any earlier link.
          </CopyableLink>
        </div>
      )}
    </>
  );
}
