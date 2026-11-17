"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import type { FormState } from "../../actions";
import { EMPTY, keepTyped } from "../../_form";

export function ResetButton({
  action,
  name,
  value,
  label,
  confirm,
  disabled,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  name: string;
  value: string;
  label: string;
  confirm: string;
  disabled: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form
      action={formAction}
      ref={keepTyped}
      onSubmit={(event) => {
        if (!window.confirm(confirm)) event.preventDefault();
      }}
      className="flex flex-col gap-2"
    >
      <input type="hidden" name={name} value={value} />
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending || disabled}
        className="w-fit"
      >
        {pending ? "Resetting…" : label}
      </Button>
      {state.error && (
        <span className="text-destructive text-xs">{state.error}</span>
      )}
    </form>
  );
}
