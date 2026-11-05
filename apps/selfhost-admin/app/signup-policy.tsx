"use client";

import { useActionState, useEffect, useState } from "react";
import { Alert, Button, Input } from "./_ui";
import { setSignupPolicyAction } from "./actions";

// `finish` is the setup wizard's last step: saving also marks setup done.
type Props = {
  domains: string[];
  finish?: boolean;
  submitLabel: string;
  onSaved?: () => void;
};

export function SignupPolicyForm({
  domains,
  finish = false,
  submitLabel,
  onSaved,
}: Props) {
  const [policy, setPolicy] = useState<"invite" | "domains">(
    domains.length > 0 ? "domains" : "invite",
  );
  const [state, action, pending] = useActionState(setSignupPolicyAction, {
    error: null,
    saved: false,
  });
  useEffect(() => {
    if (state.saved) onSaved?.();
  }, [state.saved, onSaved]);

  const option = (value: "invite" | "domains", title: string, body: string) => (
    <label className="flex cursor-pointer gap-3 rounded-xl border border-line p-4 has-checked:border-ring has-checked:bg-tint">
      <input
        type="radio"
        name="policy"
        value={value}
        className="mt-1"
        checked={policy === value}
        onChange={() => setPolicy(value)}
      />
      <span>
        <span className="block text-sm font-medium text-fg">{title}</span>
        <span className="block text-sm text-fg-muted">{body}</span>
      </span>
    </label>
  );

  return (
    <form action={action} className="flex flex-col gap-4">
      {finish && <input type="hidden" name="finish" value="true" />}
      <div className="flex flex-col gap-2">
        {option(
          "invite",
          "Invite-only",
          "Only people an administrator adds or invites get an account, whatever their address.",
        )}
        {option(
          "domains",
          "Company email",
          "Anyone with an address on your domains can create an account on their own. Invites still work for everyone else.",
        )}
      </div>
      {policy === "domains" && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-domains"
            className="text-sm font-medium text-fg"
          >
            Email domains
          </label>
          <Input
            id="signup-domains"
            name="domains"
            defaultValue={domains.join(", ")}
            placeholder="acme.com, acme.io"
            required
          />
          <p className="text-xs text-fg-muted">
            Separate several with commas. Nobody confirms these addresses by
            email, so list only domains you trust.
          </p>
        </div>
      )}
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </Button>
        {!finish && state.saved && !pending && (
          <span className="text-sm text-fg-muted">Saved</span>
        )}
      </div>
    </form>
  );
}
