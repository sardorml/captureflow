"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AppIcon } from "@/components/brand-mark";
import { authClient, signIn } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const SUBMIT_BUTTON =
  "h-10.5 rounded-[10px] bg-foreground text-background hover:bg-foreground/80";

export function SetPasswordForm({
  token,
  email,
}: {
  token: string;
  email: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) return;
    const password = String(new FormData(e.currentTarget).get("password"));
    setError(null);
    setBusy(true);
    try {
      const reset = await authClient.resetPassword({
        newPassword: password,
        token,
      });
      if (reset.error) {
        setError(
          reset.error.message ?? "Something went wrong. Please try again.",
        );
        setBusy(false);
        return;
      }
      const signedIn = await signIn.email({ email, password });
      window.location.assign(signedIn.error ? "/login" : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Card className="gap-0 rounded-2xl py-0 shadow-[0_8px_32px_-8px_rgb(0_0_0/0.12)]">
      <CardHeader className="justify-items-center border-b px-6 pt-8 pb-6 text-center [.border-b]:pb-6">
        <span className="mb-4">
          <AppIcon size={44} />
        </span>
        <CardTitle className="text-2xl tracking-tight">
          {email ? "Set your password" : "This link no longer works"}
        </CardTitle>
        <CardDescription>
          {email ? (
            <>
              Choose a password for{" "}
              <span className="text-foreground">{email}</span>. You&rsquo;ll be
              signed in afterwards.
            </>
          ) : (
            "It was already used or has expired. Ask an administrator for a new one."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6">
        {email ? (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="set-password">New password</FieldLabel>
                <Input
                  id="set-password"
                  name="password"
                  type="password"
                  required
                  minLength={12}
                  autoFocus
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                />
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>{error}</AlertTitle>
                </Alert>
              )}
              <Button type="submit" disabled={busy} className={SUBMIT_BUTTON}>
                {busy && <Spinner />}
                Save password
              </Button>
            </FieldGroup>
          </form>
        ) : (
          <Button asChild className={cn("w-full", SUBMIT_BUTTON)}>
            <Link href="/login">Go to sign in</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
