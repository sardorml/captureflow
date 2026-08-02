"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import {
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
  Typography,
} from "@heroui/react";
import { signIn, signUp } from "@/lib/auth-client";

/* eslint-disable @next/next/no-img-element */

type Mode = "signin" | "signup";
type Method = "chooser" | "email";
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
}: {
  next: string;
  initialMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [method, setMethod] = useState<Method>("chooser");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [busyProvider, setBusyProvider] = useState<SocialProvider | null>(null);

  const isSignup = mode === "signup";

  async function onSocial(provider: SocialProvider) {
    setError(null);
    setBusy(true);
    setBusyProvider(provider);
    try {
      const res = await signIn.social({ provider, callbackURL: next });
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

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
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

  return (
    <div className="w-full max-w-96">
      {/* Top-left panel slot: the logo on the chooser, "Go back" on the email
          step — the shell's <main> is the positioning context. */}
      {method === "chooser" ? (
        <Link
          href="/"
          className="absolute top-6 left-6 flex items-center gap-2.5"
        >
          <img
            src="/logo-round.png"
            alt=""
            width={32}
            height={32}
            className="rounded-lg"
          />
          <span className="text-fg text-lg font-semibold">CaptureFlow</span>
        </Link>
      ) : (
        <Button
          variant="ghost"
          isDisabled={busy}
          onPress={() => {
            setMethod("chooser");
            setError(null);
          }}
          className="absolute top-6 left-6"
        >
          <ChevronLeft size={18} />
          Go back
        </Button>
      )}

      <Typography.Heading level={3} align="center" className="mt-0 mb-1">
        {isSignup ? "Create your account" : "Welcome back"}
      </Typography.Heading>
      <Typography.Paragraph color="muted" align="center" className="mb-6">
        {isSignup
          ? "Start sharing recordings with a public link."
          : "Sign in to manage your recordings and screenshots."}
      </Typography.Paragraph>

      {method === "chooser" ? (
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isDisabled={busy && busyProvider !== "google"}
            onPress={() => onSocial("google")}
          >
            {busyProvider === "google" ? (
              <Spinner size="sm" color="current" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            isDisabled={busy && busyProvider !== "github"}
            onPress={() => onSocial("github")}
          >
            {busyProvider === "github" ? (
              <Spinner size="sm" color="current" />
            ) : (
              <GitHubIcon />
            )}
            Continue with GitHub
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            isDisabled={busy}
            onPress={() => {
              setMethod("email");
              setError(null);
            }}
          >
            <Mail size={16} />
            Continue with email
          </Button>
          {error && (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
        </div>
      ) : (
        <Form
          onSubmit={onSubmit}
          validationBehavior="native"
          className="flex flex-col gap-4"
        >
          {isSignup && (
            <TextField name="name" fullWidth>
              <Label>Name</Label>
              <Input placeholder="Your name" autoComplete="name" />
            </TextField>
          )}
          <TextField name="email" type="email" isRequired fullWidth>
            <Label>Email</Label>
            <Input placeholder="you@example.com" autoComplete="email" />
            <FieldError>Enter a valid email.</FieldError>
          </TextField>
          <TextField
            name="password"
            type="password"
            isRequired
            minLength={isSignup ? 12 : undefined}
            fullWidth
          >
            <Label>Password</Label>
            <Input
              placeholder={isSignup ? "At least 12 characters" : "••••••••"}
              autoComplete={isSignup ? "new-password" : "current-password"}
            />
            <FieldError>
              {isSignup
                ? "Use at least 12 characters."
                : "Enter your password."}
            </FieldError>
          </TextField>

          {error && (
            <Alert status="danger">
              <Alert.Content>
                <Alert.Title>{error}</Alert.Title>
              </Alert.Content>
            </Alert>
          )}

          <Button variant="primary" type="submit" fullWidth isDisabled={busy}>
            {busy && <Spinner size="sm" color="current" />}
            {isSignup ? "Create account" : "Sign in"}
          </Button>
        </Form>
      )}

      <Typography.Paragraph color="muted" align="center" className="mt-6 mb-0">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <button
          type="button"
          className="cursor-pointer text-accent hover:text-accent-strong"
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
          }}
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </Typography.Paragraph>
    </div>
  );
}
