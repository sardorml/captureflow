"use client";

import { useState } from "react";
import { Alert, Button, Card, Flex, Form, Input, Typography } from "antd";
import type { Rule } from "antd/es/form";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "signin" | "signup";
type Values = { name?: string; email: string; password: string };

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
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

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
    <Card style={{ width: "100%", maxWidth: 384 }}>
      <Flex align="center" gap={10} style={{ marginBottom: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-round.png"
          alt=""
          width={32}
          height={32}
          style={{ borderRadius: 8 }}
        />
        <Typography.Text strong style={{ fontSize: 18 }}>
          CaptureFlow
        </Typography.Text>
      </Flex>

      <Typography.Title level={4} style={{ marginTop: 0, marginBottom: 4 }}>
        {isSignup ? "Create your account" : "Welcome back"}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
        {isSignup
          ? "Start sharing recordings with a public link."
          : "Sign in to manage your recordings and screenshots."}
      </Typography.Paragraph>

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
            { required: true, type: "email", message: "Enter a valid email." },
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
    </Card>
  );
}
