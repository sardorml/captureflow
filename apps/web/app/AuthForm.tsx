"use client";

import { useState, type FormEvent } from "react";
import { ChevronLeft } from "lucide-react";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { AppIcon } from "@/components/brand-mark";
import { signIn, signUp } from "@/lib/auth-client";
import type { InviteContext } from "@/lib/invite-context";

type Mode = "signin" | "signup";
// Email-first: the address is collected on its own, then the password (and a
// name on signup) on a second step, so the entry screen stays one field deep.
type Step = "email" | "credentials";
type SocialProvider = "google" | "github";

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

// Kept separate from the marketing AuthPanel, which pulls in the i18n provider
// and marketing shell.
export function AuthForm({
  next,
  initialMode = "signin",
  invite = null,
  initialError = null,
}: {
  next: string;
  initialMode?: Mode;
  invite?: InviteContext | null;
  initialError?: string | null;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<Step>("email");
  // Prefilled, not locked: accepting needs this exact address, but someone who
  // types a different one gets told so by the invite page itself.
  const [email, setEmail] = useState(invite?.email ?? "");
  const [error, setError] = useState<string | null>(initialError);
  const [busy, setBusy] = useState(false);
  const [busyProvider, setBusyProvider] = useState<SocialProvider | null>(null);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const isSignup = mode === "signup";

  async function onSocial(provider: SocialProvider) {
    setError(null);
    setBusy(true);
    setBusyProvider(provider);
    try {
      const res = await signIn.social({
        provider,
        callbackURL: next,
        errorCallbackURL: `/login?next=${encodeURIComponent(next)}`,
      });
      if (res.error) {
        setError(
          res.error.message ?? "Something went wrong. Please try again.",
        );
        setBusy(false);
        setBusyProvider(null);
      }
      // On success the client navigates to the provider's consent page.
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
      setBusyProvider(null);
    }
  }

  function onEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setStep("credentials");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") ?? "");
    const name = String(data.get("name") ?? "");

    setError(null);
    setBusy(true);
    try {
      const res = isSignup
        ? await signUp.email({
            email,
            password,
            name: name.trim() || email.split("@")[0],
          })
        : await signIn.email({ email, password });
      if (res.error) {
        setError(
          res.error.message ?? "Something went wrong. Please try again.",
        );
        setBusy(false);
        return;
      }
      // Full navigation so the freshly-set session cookie is read by the
      // middleware and server components on the destination.
      window.location.assign(next);
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  const errorAlert = error ? (
    <Alert variant="destructive">
      <AlertTitle>{error}</AlertTitle>
    </Alert>
  ) : null;

  const title = invite
    ? `Join ${invite.workspaceName}`
    : isSignup
      ? "Create your account"
      : "Welcome back";

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/"
        className="flex items-center gap-2 self-center font-medium"
      >
        <AppIcon size={24} />
        CaptureFlow
      </Link>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {/* One line for both modes when invited: they can't know whether
              they already have an account, so offering the pair beats
              guessing which they need. */}
          <CardDescription>
            {invite ? (
              <>
                {invite.inviterLabel} invited you. Sign in or create an account
                with <span className="text-foreground">{invite.email}</span> to
                accept.
              </>
            ) : isSignup ? (
              "Sign up with Google, GitHub or your email"
            ) : (
              "Log in with Google, GitHub or your email"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "email" ? (
            <FieldGroup>
              <Field>
                <Button
                  variant="outline"
                  disabled={busy && busyProvider !== "google"}
                  onClick={() => onSocial("google")}
                >
                  {busyProvider === "google" ? <Spinner /> : <GoogleIcon />}
                  Continue with Google
                </Button>
                <Button
                  variant="outline"
                  disabled={busy && busyProvider !== "github"}
                  onClick={() => onSocial("github")}
                >
                  {busyProvider === "github" ? <Spinner /> : <GitHubIcon />}
                  Continue with GitHub
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <form onSubmit={onEmailSubmit}>
                <FieldGroup>
                  <Field data-invalid={emailInvalid || undefined}>
                    <FieldLabel htmlFor="auth-email">Email</FieldLabel>
                    <Input
                      id="auth-email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailInvalid(false);
                      }}
                      onInvalid={(e) => {
                        e.preventDefault();
                        setEmailInvalid(true);
                        e.currentTarget.focus();
                      }}
                      aria-invalid={emailInvalid || undefined}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                    {emailInvalid && (
                      <FieldError>Enter a valid email.</FieldError>
                    )}
                  </Field>
                  <Field>
                    <Button type="submit" disabled={busy}>
                      Continue with Email
                    </Button>
                    {errorAlert}
                    <FieldDescription className="text-center">
                      {isSignup
                        ? "Already have an account? "
                        : "Don't have an account? "}
                      <button
                        type="button"
                        className="cursor-pointer underline underline-offset-4 hover:text-primary"
                        onClick={() => {
                          setMode(isSignup ? "signin" : "signup");
                          setError(null);
                        }}
                      >
                        {isSignup ? "Log in" : "Sign up"}
                      </button>
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </FieldGroup>
          ) : (
            <form onSubmit={onSubmit}>
              <FieldGroup>
                {/* The address is already captured; this is the receipt for it
                    plus the way back to change it. */}
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm text-muted-foreground">
                    {email}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    className="inline-flex cursor-pointer items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setStep("email");
                      setError(null);
                    }}
                  >
                    <ChevronLeft size={14} />
                    Change
                  </button>
                </div>

                {isSignup && (
                  <Field>
                    <FieldLabel htmlFor="auth-name">Name</FieldLabel>
                    <Input
                      id="auth-name"
                      name="name"
                      placeholder="Your name"
                      autoComplete="name"
                    />
                  </Field>
                )}

                <Field data-invalid={passwordInvalid || undefined}>
                  <FieldLabel htmlFor="auth-password">Password</FieldLabel>
                  <Input
                    id="auth-password"
                    name="password"
                    type="password"
                    required
                    minLength={isSignup ? 12 : undefined}
                    autoFocus
                    onChange={() => setPasswordInvalid(false)}
                    onInvalid={(e) => {
                      e.preventDefault();
                      setPasswordInvalid(true);
                      e.currentTarget.focus();
                    }}
                    aria-invalid={passwordInvalid || undefined}
                    placeholder={
                      isSignup ? "At least 12 characters" : undefined
                    }
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
                  />
                  {passwordInvalid && (
                    <FieldError>
                      {isSignup
                        ? "Use at least 12 characters."
                        : "Enter your password."}
                    </FieldError>
                  )}
                </Field>

                <Field>
                  {errorAlert}
                  <Button type="submit" disabled={busy}>
                    {busy && <Spinner />}
                    {isSignup ? "Create account" : "Log in"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          )}
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{" "}
        <Link href="/terms">Terms of Service</Link> and{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  );
}
