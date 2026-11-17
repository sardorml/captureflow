"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { resetRecordingCountAction } from "../../actions";
import { EMPTY, keepTyped } from "../../_form";

export function ResetRecordingCount({
  userId,
  used,
}: {
  userId: string;
  used: number;
}) {
  const [state, formAction, pending] = useActionState(
    resetRecordingCountAction,
    EMPTY,
  );
  return (
    <form
      action={formAction}
      ref={keepTyped}
      onSubmit={(event) => {
        const ok = window.confirm(
          "Start this user's recording count over? Their recordings stay; only new ones count toward the limit.",
        );
        if (!ok) event.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name="userId" value={userId} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending || used === 0}
        className="w-fit"
      >
        {pending ? "Resetting…" : "Reset count"}
      </Button>
      {state.error && (
        <span className="text-destructive text-xs">{state.error}</span>
      )}
    </form>
  );
}
