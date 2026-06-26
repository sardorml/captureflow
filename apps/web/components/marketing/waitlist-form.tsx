"use client";

import { useState } from "react";
import Link from "next/link";
import { Alert, Button, Flex, Form, Input, Space, Typography } from "antd";
import { track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";

type WaitlistFormProps = {
  className?: string;
};

type WaitlistFormValues = {
  email: string;
};

export function WaitlistForm({ className }: WaitlistFormProps) {
  const m = useMessages();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({ email }: WaitlistFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? m.waitlist.errors.joinFailed);
        setLoading(false);
        return;
      }
      track("waitlist_joined");
      setSubmitted(true);
    } catch {
      setError(m.waitlist.errors.network);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Alert
        className={className}
        type="success"
        showIcon
        message={m.waitlist.success}
      />
    );
  }

  return (
    <Flex
      className={className}
      vertical
      gap="small"
      style={{ width: "100%", maxWidth: 448 }}
    >
      <Form<WaitlistFormValues>
        layout="inline"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Space.Compact style={{ width: "100%" }}>
          <Form.Item
            name="email"
            rules={[{ required: true, type: "email" }]}
            style={{ flex: 1, marginInlineEnd: 0 }}
          >
            <Input
              type="email"
              size="large"
              aria-label={m.waitlist.emailPlaceholder}
              placeholder={m.waitlist.emailPlaceholder}
            />
          </Form.Item>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
          >
            {loading ? m.waitlist.buttonLoading : m.waitlist.buttonDefault}
          </Button>
        </Space.Compact>
      </Form>
      {error && <Alert type="error" showIcon message={error} />}
      <Typography.Text type="secondary">
        {m.waitlist.earlyAccessPrompt}{" "}
        <Link href="/beta-tester">{m.waitlist.earlyAccessLink}</Link>.
      </Typography.Text>
    </Flex>
  );
}
