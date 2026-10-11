"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import { revokeUserAccessAction } from "../../actions";
import { EMPTY, keepTyped } from "../../_form";

export function SignOutEverywhere({
  userId,
  sessions,
  devices,
}: {
  userId: string;
  sessions: number;
  devices: number;
}) {
  const [state, formAction, pending] = useActionState(
    revokeUserAccessAction,
    EMPTY,
  );
  return (
    <form
      action={formAction}
      ref={keepTyped}
      onSubmit={(event) => {
        const ok = window.confirm(
          `Sign this user out of ${sessions} browser sessions and ${devices} devices?`,
        );
        if (!ok) event.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="danger-soft"
        size="sm"
        isDisabled={pending || sessions + devices === 0}
        className="w-fit"
      >
        {pending ? "Signing out…" : "Sign out everywhere"}
      </Button>
      {state.error && (
        <span className="text-danger text-xs">{state.error}</span>
      )}
    </form>
  );
}
