"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { Button, Description, Input, Label, TextField } from "@heroui/react";
import type { FormState } from "./actions";
import { Notice } from "./_ui";

export const EMPTY: FormState = { error: null };

/*
 * React 19 resets a form once its action resolves, and React Aria's fields
 * revert along with it — so a failed submit would wipe the token that was
 * pasted and the email that was typed, which is the loop that made a wrong
 * setup token look unfixable. Cancelling the reset is the supported opt-out:
 * the fields skip their revert when the event was already default-prevented.
 * A ref callback registers this ahead of theirs, which is what makes it win.
 */
export function keepTyped(form: HTMLFormElement | null) {
  form?.addEventListener("reset", (event) => event.preventDefault());
}

/*
 * One shape for every mutating form: the action returns the failure, the form
 * renders it in place, and nothing lands in the URL. Because the page does not
 * navigate on failure, whatever was typed survives the round trip.
 */
export function ActionForm({
  action,
  submit,
  busy,
  children,
  className = "flex flex-col gap-3",
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  submit: string;
  busy?: string;
  children: ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form action={formAction} ref={keepTyped} className={className}>
      {children}
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Button
        type="submit"
        variant="primary"
        isDisabled={pending}
        className="w-fit"
      >
        {pending ? (busy ?? "Working…") : submit}
      </Button>
    </form>
  );
}

// Row-level controls: a bare button, with any failure surfaced beside it.
export function ActionButton({
  action,
  label,
  busyLabel,
  variant = "ghost",
  children,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  label: string;
  busyLabel?: string;
  variant?: "ghost" | "danger-soft";
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, EMPTY);
  return (
    <form
      action={formAction}
      ref={keepTyped}
      className="flex items-center gap-2"
    >
      {children}
      <Button type="submit" variant={variant} size="sm" isDisabled={pending}>
        {pending ? (busyLabel ?? "…") : label}
      </Button>
      {state.error && (
        <span className="text-danger text-xs">{state.error}</span>
      )}
    </form>
  );
}

export function TextRow({
  name,
  label,
  hint,
  type = "text",
  value,
  onChange,
  defaultValue,
  autoComplete,
  autoFocus,
  placeholder,
  inputMode,
}: {
  name: string;
  label: string;
  hint?: string;
  type?: "text" | "email" | "password";
  value?: string;
  onChange?: (next: string) => void;
  defaultValue?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  placeholder?: string;
  inputMode?: "numeric";
}) {
  return (
    <TextField
      name={name}
      type={type}
      fullWidth
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
    >
      <Label>{label}</Label>
      <Input
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {hint && <Description>{hint}</Description>}
    </TextField>
  );
}
