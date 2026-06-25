"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Alert, Button, Card, Input, Result, Spin } from "antd";

type Props = {
  appWebUrl: string;
  slug: string;
  viewer: {
    email: string;
    name: string | null;
  } | null;
  returnUrl: string;
  ownerName: string | null;
};

export function RequestAccess({
  appWebUrl,
  slug,
  viewer,
  returnUrl,
  ownerName,
}: Props) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probing, setProbing] = useState(() => hasSessionCookieAtMount());

  useEffect(() => {
    if (!probing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${appWebUrl}/api/verify-session`, {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });
        if (cancelled) return;
        if (res.ok) {
          // replace() not reload() so back doesn't bounce onto the gate.
          window.location.replace(window.location.href);
          return;
        }
        setProbing(false);
      } catch {
        if (!cancelled) setProbing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [appWebUrl, probing]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || sent) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${appWebUrl}/api/request-access`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind: "recording",
          key: slug,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? "request-failed");
      }
      setSent(true);
    } catch (err) {
      console.error("request-access submit", err);
      setError("Something went wrong. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  const signInUrl = `${appWebUrl}/login?next=${encodeURIComponent(returnUrl)}`;

  if (probing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
        <div className="flex flex-col items-center gap-4">
          <Spin />
          <p className="text-sm text-fg-subtle">Loading recording…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <Card style={{ width: "100%", maxWidth: 448 }}>
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-overlay text-fg-muted ring-1 ring-line-strong">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg-strong">
            Request access to view this video
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            {ownerName
              ? `${ownerName} hasn't shared this recording with you yet.`
              : "The owner hasn't shared this recording with you yet."}
          </p>
        </div>

        {!viewer ? (
          <div className="mt-8">
            <p className="text-sm text-fg-muted">
              Sign in with your work email — if you&apos;re already on the
              owner&apos;s team you&apos;ll be let straight in.
            </p>
            <Button
              type="primary"
              size="large"
              block
              href={signInUrl}
              icon={<ArrowRight size={16} />}
              iconPosition="end"
              style={{ marginTop: 20 }}
            >
              Sign in to continue
            </Button>
          </div>
        ) : sent ? (
          <Result
            status="success"
            title="Request sent"
            subTitle="We let the owner know. You'll get an email if they grant access."
          />
        ) : (
          <form onSubmit={onSubmit} className="mt-8">
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <Mail className="h-4 w-4 text-fg-subtle" aria-hidden />
              <span className="truncate">
                Asking as{" "}
                <strong className="font-medium text-fg-strong">
                  {viewer.email}
                </strong>
              </span>
            </div>
            <label
              htmlFor="access-message"
              className="mt-5 block text-sm font-medium text-fg"
            >
              Add a note <span className="text-fg-subtle">(optional)</span>
            </label>
            <Input.TextArea
              id="access-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Hi — I'd like to watch this recording from yesterday's review."
              style={{ marginTop: 8, resize: "none" }}
            />
            <Button
              type="primary"
              size="large"
              block
              htmlType="submit"
              loading={submitting}
              style={{ marginTop: 16 }}
            >
              {submitting ? "Sending…" : "Request access"}
            </Button>
            {error && (
              <Alert type="error" message={error} showIcon className="mt-3" />
            )}
          </form>
        )}
      </Card>
    </div>
  );
}

function hasSessionCookieAtMount(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("session_token");
}
