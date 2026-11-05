"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useAppMessages } from "@/components/app-i18n-provider";
import { fill } from "@/lib/i18n/fill";
import { fmt } from "@/lib/i18n/format";
import Link from "next/link";

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
  const m = useAppMessages();
  const copy = m.viewer.requestAccess;
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
      setError(copy.failed);
    } finally {
      setSubmitting(false);
    }
  }

  const signInUrl = `${appWebUrl}/login?next=${encodeURIComponent(returnUrl)}`;

  if (probing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="size-5" />
          <p className="text-sm text-fg-subtle">{m.viewer.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-16">
      <Card className="w-full max-w-md gap-0 p-6">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tint text-fg-muted ring-1 ring-line-strong">
            <Lock className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight text-fg-strong">
            {copy.title}
          </h1>
          <p className="mt-2 text-sm text-fg-muted">
            {ownerName
              ? fmt(copy.notSharedBy, { name: ownerName })
              : copy.notSharedByOwner}
          </p>
        </div>

        {!viewer ? (
          <div className="mt-8">
            <p className="text-sm text-fg-muted">{copy.signInHint}</p>
            <Link
              href={signInUrl}
              className={buttonVariants({
                size: "lg",
                className: "mt-5 w-full",
              })}
            >
              {copy.signIn}
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : sent ? (
          <div className="mt-8 text-center">
            <p className="text-lg font-semibold text-fg-strong">
              {copy.sentTitle}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{copy.sentDescription}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8">
            <div className="flex items-center gap-2 text-sm text-fg-muted">
              <Mail className="h-4 w-4 text-fg-subtle" aria-hidden />
              <span className="truncate">
                {fill(copy.askingAs, {
                  email: (
                    <strong className="font-medium text-fg-strong">
                      {viewer.email}
                    </strong>
                  ),
                })}
              </span>
            </div>
            <label
              htmlFor="access-message"
              className="mt-5 block text-sm font-medium text-fg"
            >
              {fill(copy.noteLabel, {
                optional: (
                  <span className="text-fg-subtle">{copy.noteOptional}</span>
                ),
              })}
            </label>
            <Textarea
              id="access-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder={copy.notePlaceholder}
              className="mt-2 w-full resize-none"
            />
            <Button
              size="lg"
              type="submit"
              disabled={submitting}
              className="mt-4 w-full"
            >
              {submitting && <Spinner className="size-4" />}
              {submitting ? copy.sending : copy.submit}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-3">
                <AlertTitle>{error}</AlertTitle>
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
