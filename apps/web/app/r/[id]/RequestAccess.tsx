'use client';

import { useEffect, useState } from 'react';
import { Lock, Mail, ArrowRight, Check } from 'lucide-react';
import { GridLoader } from '@captureflow/ui';

// Loom-style "Request access" screen rendered when a signed-in viewer
// (or anonymous visitor) hits a workspace/private share they can't see.
//
// Two states:
//   - Anonymous: prompts the visitor to sign in on app-web. After
//     auth they bounce back here via the `next` param, and the
//     visibility gate either passes (they were a member all along) or
//     this same screen renders again — now in the signed-in branch.
//   - Signed-in: short form (optional message) that POSTs to
//     app-web's /api/request-access. Backend identifies the requester
//     from the cross-subdomain cookie and emails the owner.

type Props = {
  appWebUrl: string;
  slug: string;
  viewer: {
    email: string;
    name: string | null;
  } | null;
  returnUrl: string;
  // Owner name when known — purely cosmetic. Backend never reveals
  // the owner's email to the requester.
  ownerName: string | null;
};

export function RequestAccess({
  appWebUrl,
  slug,
  viewer,
  returnUrl,
  ownerName,
}: Props) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When the browser has a session cookie but SSR rendered this page
  // anyway (cold-start blip, cross-tab cookie race), hide the
  // RequestAccess copy behind a loading shim while we probe. Without
  // this the user reads "Sign in to continue" for ~half a second
  // before the page reloads under them — feels like a bug even when
  // we recover automatically.
  const [probing, setProbing] = useState(() => hasSessionCookieAtMount());

  // Self-heal: the SSR gate occasionally renders RequestAccess when the
  // session cookie didn't reach the worker on the first hit (cross-tab
  // open with stripped referrer, worker cold-start tail, Brave shields
  // racing the navigation). Probe verify-session client-side on mount —
  // if a session actually exists, replace the URL so SSR re-renders
  // the viewer instead of forcing the user to refresh manually.
  useEffect(() => {
    if (!probing) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${appWebUrl}/api/verify-session`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (cancelled) return;
        if (res.ok) {
          // replace() instead of reload() so the back button doesn't
          // bounce the visitor onto the gate they just escaped.
          window.location.replace(window.location.href);
          return;
        }
        // 401 (or anything else): genuinely no session. Drop the shim
        // and show the real RequestAccess content.
        setProbing(false);
      } catch {
        // Network error — show the real content; the visitor can still
        // sign in or request access manually.
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
        method: 'POST',
        credentials: 'include',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          kind: 'share',
          key: slug,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(body?.error ?? 'request-failed');
      }
      setSent(true);
    } catch (err) {
      console.error('request-access submit', err);
      setError('Something went wrong. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  }

  const signInUrl = `${appWebUrl}/login?next=${encodeURIComponent(returnUrl)}`;

  if (probing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-neutral-300">
        <div className="flex flex-col items-center gap-4">
          <GridLoader />
          <p className="text-sm text-neutral-500">Loading recording…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6 py-16 text-neutral-100">
      <div className="w-full max-w-md">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-overlay ring-1 ring-line-strong">
          <Lock className="h-6 w-6 text-neutral-400" aria-hidden />
        </div>
        <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-neutral-50">
          Request access to view this video
        </h1>
        <p className="mt-2 text-center text-sm text-neutral-400">
          {ownerName
            ? `${ownerName} hasn't shared this recording with you yet.`
            : "The owner hasn't shared this recording with you yet."}
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
                Asking as{' '}
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
              placeholder="Hi — I'd like to watch this recording from yesterday's review."
              className="mt-2 w-full resize-none rounded-md border border-line-strong bg-neutral-950 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-60"
            >
              {submitting ? 'Sending…' : 'Request access'}
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

// Cheap heuristic: any better-auth cookie name contains `session_token`
// (default `better-auth.session_token`, secure-prefix variants
// included). When present we know the visitor *has* a session locally;
// SSR just didn't see it (cold-start, blocked subrequest, etc.) and we
// should hide the gate behind a probe instead of flashing it.
function hasSessionCookieAtMount(): boolean {
  if (typeof document === 'undefined') return false;
  return document.cookie.includes('session_token');
}
