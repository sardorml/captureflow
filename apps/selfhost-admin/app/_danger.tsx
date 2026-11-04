"use client";

import { useActionState } from "react";
import { Alert, Button } from "./_ui";
import type { DangerState } from "./actions";

// A destructive action behind a browser confirm, with the server's refusal shown inline.
export function DangerForm({
  action,
  confirm,
  label,
  pendingLabel,
  fields,
  size = "md",
  variant = "danger",
}: {
  action: (prev: DangerState, formData: FormData) => Promise<DangerState>;
  confirm: string;
  label: string;
  pendingLabel?: string;
  fields: Record<string, string>;
  size?: "sm" | "md";
  variant?: "danger" | "secondary";
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!window.confirm(confirm)) e.preventDefault();
      }}
      className="flex flex-col items-end gap-2"
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button type="submit" variant={variant} size={size} disabled={pending}>
        {pending ? (pendingLabel ?? label) : label}
      </Button>
      {state.error && <Alert tone="error">{state.error}</Alert>}
    </form>
  );
}
