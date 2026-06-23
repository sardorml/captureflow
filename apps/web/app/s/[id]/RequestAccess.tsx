"use client";

import { useEffect, useState } from "react";
import { Lock, Mail, ArrowRight, Check } from "lucide-react";

// Access-request screen shown when a visitor isn't authorized for a snap.

type Props = {
  appWebUrl: string;
  snapId: string;
  viewer: {
    email: string;
    name: string | null;
  } | null;
  returnUrl: string;
  ownerName: string | null;
};

export function RequestAccess({
  appWebUrl,
  snapId,
  viewer,
  returnUrl,
  ownerName,
}: Props) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*
   * Self-heal: the SSR gate occasionally renders RequestAccess when the
   * session cookie didn't reach the server on the first hit (cross-tab
   * open with stripped referrer, cold-start tail, Brave shields racing
   * the navigation). Probe verify-session on mount — if a session
   * actually exists, reload so SSR re-renders the viewer instead of
   * forcing a manual refresh.
   */
  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`${appWebUrl}/api/verify-session`, {
          method: "GET",
          credentials: "include",
        });
        if (cancelled) return;
        if (res.ok) window.location.reload();
      } catch {
        // Network error — visitor stays on RequestAccess; harmless.
      }
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [appWebUrl]);

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
          kind: "snap",
          key: snapId,
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-neutral-100">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-overlay ring-1 ring-line-strong">
          <Lock className="h-6 w-6 text-neutral-400" aria-hidden />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-neutral-50">
          Request access to view this snap
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-400">
          {ownerName
            ? `${ownerName} hasn't shared this snap with you yet.`
            : "The owner hasn't shared this snap with you yet."}
        </p>

        {!viewer ? (
          <div className="mt-8 rounded-2xl border border-line-strong bg-neutral-900/60 p-6">
            <p className="text-sm text-neutral-300">
              Sign in with your work email — if you&apos;re already on the
              owner&apos;s team you&apos;ll be let straight in.
            </p>
            <a
              href={signInUrl}
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Sign in to continue
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        ) : sent ? (
          <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
              <Check className="h-5 w-5 text-emerald-300" aria-hidden />
            </div>
            <p className="mt-3 text-sm font-medium text-emerald-200">
              Request sent
            </p>
            <p className="mt-1 text-sm text-emerald-200/70">
              We let the owner know. You&apos;ll get an email if they grant
              access.
            </p>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="mt-8 rounded-2xl border border-line-strong bg-neutral-900/60 p-6"
          >
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <Mail className="h-4 w-4 text-neutral-500" aria-hidden />
              <span className="truncate">
                Asking as{" "}
                <strong className="font-medium text-neutral-100">
                  {viewer.email}
                </strong>
              </span>
            </div>
            <label
              htmlFor="access-message"
              className="mt-5 block text-sm font-medium text-neutral-300"
            >
              Add a note <span className="text-neutral-500">(optional)</span>
            </label>
            <textarea
              id="access-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder="Hi — I'd like a copy of this screenshot from the design review."
              className="mt-2 w-full resize-none rounded-md border border-line-strong bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Request access"}
            </button>
            {error && (
              <p className="mt-3 text-center text-sm text-red-400">{error}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
