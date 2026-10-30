"use client";

import { useState } from "react";
import { Text } from "./typography";
import Link from "next/link";
import { Flex, Space } from "./layout";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "./ui";
import { track } from "@/lib/marketing/track";
import { useMessages } from "./i18n-provider";

type WaitlistFormProps = {
  className?: string;
};

export function WaitlistForm({ className }: WaitlistFormProps) {
  const m = useMessages();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
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
      <Alert className={cn("text-emerald-500", className)}>
        <AlertTitle>{m.waitlist.success}</AlertTitle>
      </Alert>
    );
  }

  return (
    <Flex
      className={className}
      vertical
      gap="small"
      style={{ width: "100%", maxWidth: 448 }}
    >
      <form onSubmit={handleSubmit}>
        <Space.Compact style={{ width: "100%" }}>
          <Input
            name="email"
            type="email"
            required
            aria-label={m.waitlist.emailPlaceholder}
            placeholder={m.waitlist.emailPlaceholder}
          />
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={loading}
          >
            {loading ? m.waitlist.buttonLoading : m.waitlist.buttonDefault}
          </Button>
        </Space.Compact>
      </form>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      <Text type="secondary">
        {m.waitlist.earlyAccessPrompt}{" "}
        <Link href="/beta-tester">{m.waitlist.earlyAccessLink}</Link>.
      </Text>
    </Flex>
  );
}
