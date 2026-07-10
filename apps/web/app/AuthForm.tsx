"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import { Alert, Button, Flex, Form, Input, Typography } from "antd";
import type { Rule } from "antd/es/form";
import { signIn, signUp } from "@/lib/auth-client";

/* eslint-disable @next/next/no-img-element */

type Mode = "signin" | "signup";
type Method = "chooser" | "email";
type SocialProvider = "google" | "github";
type Values = { name?: string; email: string; password: string };

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

  async function onFinish(values: Values) {
    setError(null);
    setBusy(true);
    try {
      const res = isSignup
        ? await signUp.email({
            email: values.email,
            password: values.password,
            name: values.name?.trim() || values.email.split("@")[0],
          })
        : await signIn.email({
            email: values.email,
            password: values.password,
          });
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

  const passwordRules: Rule[] = [
    { required: true, message: "Enter your password." },
    ...(isSignup
      ? [{ min: 12, message: "Use at least 12 characters." } as Rule]
      : []),
  ];

  return (
    <div style={{ width: "100%", maxWidth: 384 }}>
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
          type="text"
          icon={<ChevronLeft size={18} />}
          disabled={busy}
          onClick={() => {
            setMethod("chooser");
            setError(null);
          }}
          style={{ position: "absolute", top: 24, left: 24 }}
        >
          Go back
        </Button>
      )}
      <Typography.Title
        level={3}
        style={{ marginTop: 0, marginBottom: 4, textAlign: "center" }}
      >
        {isSignup ? "Create your account" : "Welcome back"}
      </Typography.Title>
      <Typography.Paragraph
        type="secondary"
        style={{ marginBottom: 24, textAlign: "center" }}
      >
        {isSignup
          ? "Start sharing recordings with a public link."
          : "Sign in to manage your recordings and screenshots."}
      </Typography.Paragraph>

      {method === "chooser" ? (
        <Flex vertical gap={12}>
          <Button
            type="primary"
            size="large"
            block
            icon={<GoogleIcon />}
            loading={busyProvider === "google"}
            disabled={busy && busyProvider !== "google"}
            onClick={() => onSocial("google")}
          >
            Continue with Google
          </Button>
          <Button
            size="large"
            block
            icon={<GitHubIcon />}
            loading={busyProvider === "github"}
            disabled={busy && busyProvider !== "github"}
            onClick={() => onSocial("github")}
          >
            Continue with GitHub
          </Button>
          <Button
            size="large"
            block
            icon={<Mail size={16} />}
            disabled={busy}
            onClick={() => {
              setMethod("email");
              setError(null);
            }}
          >
            Continue with email
          </Button>
          {error && <Alert type="error" message={error} showIcon />}
        </Flex>
      ) : (
        <>
          <Form
            layout="vertical"
            requiredMark={false}
            disabled={busy}
            onFinish={onFinish}
          >
            {isSignup && (
              <Form.Item label="Name" name="name">
                <Input placeholder="Your name" autoComplete="name" />
              </Form.Item>
            )}
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Enter a valid email.",
                },
              ]}
            >
              <Input placeholder="you@example.com" autoComplete="email" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={passwordRules}>
              <Input.Password
                placeholder={isSignup ? "At least 12 characters" : "••••••••"}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </Form.Item>

            {error && (
              <Form.Item>
                <Alert type="error" message={error} showIcon />
              </Form.Item>
            )}

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit" loading={busy} block>
                {isSignup ? "Create account" : "Sign in"}
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <Typography.Paragraph
        type="secondary"
        style={{ textAlign: "center", marginTop: 24, marginBottom: 0 }}
      >
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <Typography.Link
          onClick={() => {
            setMode(isSignup ? "signin" : "signup");
            setError(null);
          }}
        >
          {isSignup ? "Sign in" : "Sign up"}
        </Typography.Link>
      </Typography.Paragraph>
    </div>
  );
}
