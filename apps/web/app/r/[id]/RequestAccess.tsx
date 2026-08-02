"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import {
  Alert,
  Button,
  Card,
  Spinner,
  TextArea,
  buttonVariants,
} from "@heroui/react";

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
          <Spinner />
          <p className="text-sm text-fg-subtle">Loading recording…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
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
            <a
              href={signInUrl}
              className={buttonVariants({
                variant: "primary",
                size: "lg",
                fullWidth: true,
                className: "mt-5",
              })}
            >
              Sign in to continue
              <ArrowRight size={16} />
            </a>
          </div>
        ) : sent ? (
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-fg-strong">Request sent</p>
            <p className="mt-1 text-sm text-fg-muted">
              We let the owner know. You&apos;ll get an email if they grant
              access.
            </p>
          </div>
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
            <TextArea
              id="access-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Hi — I'd like to watch this recording from yesterday's review."
              className="mt-2 resize-none"
            />
            <Button
              variant="primary"
              size="lg"
              fullWidth
              type="submit"
              isDisabled={submitting}
              className="mt-4"
            >
              {submitting && <Spinner size="sm" color="current" />}
              {submitting ? "Sending…" : "Request access"}
            </Button>
            {error && (
              <Alert status="danger" className="mt-3">
                <Alert.Content>
                  <Alert.Title>{error}</Alert.Title>
                </Alert.Content>
              </Alert>
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
