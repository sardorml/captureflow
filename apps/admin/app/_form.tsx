"use client";

import { type ReactNode, useActionState, useId } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { FormState } from "./actions";
import { Notice } from "./_ui";

export const EMPTY: FormState = { error: null };

/*
 * React 19 resets a form once its action resolves, so a failed submit would
 * wipe the token that was pasted and the email that was typed, which is the
 * loop that made a wrong setup token look unfixable. Cancelling the reset
 * event keeps what was typed.
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
      <Button type="submit" disabled={pending} className="w-fit">
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
      <Button
        type="submit"
        variant={variant === "danger-soft" ? "destructive" : "ghost"}
        size="sm"
        disabled={pending}
      >
        {pending ? (busyLabel ?? "…") : label}
      </Button>
      {state.error && (
        <span className="text-destructive text-xs">{state.error}</span>
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
  inputMode?: "numeric" | "decimal";
}) {
  const id = useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange && ((e) => onChange(e.target.value))}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        placeholder={placeholder}
        inputMode={inputMode}
      />
      {hint && <FieldDescription>{hint}</FieldDescription>}
    </Field>
  );
}
