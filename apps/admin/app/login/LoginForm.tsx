"use client";

import { useActionState } from "react";
import { Button } from "@heroui/react";
import { signInAction } from "../actions";
import type { FormState } from "../actions";
import { TextRow, keepTyped } from "../_form";
import { Notice } from "../_ui";

const NO_ERROR: FormState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, NO_ERROR);

  return (
    <form action={formAction} ref={keepTyped} className="flex flex-col gap-3">
      <TextRow
        name="email"
        label="Email"
        type="email"
        autoComplete="username"
        autoFocus
      />
      <TextRow
        name="password"
        label="Password"
        type="password"
        autoComplete="current-password"
      />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Button type="submit" variant="primary" isDisabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
