'use client';

import { useRef, useState, useSyncExternalStore, useTransition } from 'react';
import { UserPlus, X } from 'lucide-react';
import {
  SmoothButton,
  SmoothDialog,
  SmoothDialogContent,
  SmoothDialogDescription,
  SmoothDialogHeader,
  SmoothDialogTitle,
  SmoothDialogTrigger,
} from '@captureflow/ui';
import { inviteMemberAction } from './members/actions';

// Invite modal with a chip-input: typing an email and hitting
// space/comma/enter turns it into a removable chip. Submitting fires
// one server action per chip and surfaces a combined success/failure
// summary.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Result = { sent: string[]; failed: { email: string; error: string }[] };

type InviteModalProps = {
  // Optional custom trigger, rendered inside DialogTrigger asChild.
  // When omitted, falls back to the default "Invite teammates" button.
  trigger?: React.ReactNode;
};

export function InviteModal({ trigger }: InviteModalProps = {}) {
  const [open, setOpen] = useState(false);
  const [chips, setChips] = useState<string[]>([]);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  // Radix's asChild Slot injects a generated useId on the client; SSR
  // can't reproduce it 1:1, so rendering the wired-up trigger during
  // SSR breaks hydration (which silently disables Fast Refresh). Render
  // the bare trigger until mounted, then swap in the live dialog so the
  // server and first client render match exactly.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const reset = () => {
    setChips([]);
    setDraft('');
    setError(null);
    setResult(null);
  };

  const commitDraft = (raw: string): boolean => {
    const email = raw.trim().replace(/,$/, '');
    if (!email) return true;
    if (!EMAIL_RE.test(email)) {
      setError(`"${email}" isn't a valid email`);
      return false;
    }
    if (chips.includes(email)) {
      setError(`${email} is already in the list`);
      return false;
    }
    setChips((prev) => [...prev, email]);
    setError(null);
    return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === ' ' ||
      e.key === ',' ||
      e.key === 'Enter' ||
      e.key === 'Tab'
    ) {
      if (draft.trim()) {
        e.preventDefault();
        if (commitDraft(draft)) setDraft('');
      }
    } else if (e.key === 'Backspace' && !draft && chips.length > 0) {
      e.preventDefault();
      setChips((prev) => prev.slice(0, -1));
    }
  };

  // Pasting "a@x.com, b@y.com" should chip both at once.
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    if (!/[\s,]/.test(text)) return;
    e.preventDefault();
    const parts = text
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    setError(null);
    setChips((prev) => {
      const seen = new Set(prev);
      const next = [...prev];
      for (const p of parts) {
        if (!EMAIL_RE.test(p) || seen.has(p)) continue;
        seen.add(p);
        next.push(p);
      }
      return next;
    });
  };

  const removeChip = (email: string) => {
    setChips((prev) => prev.filter((c) => c !== email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    // Pending draft text counts toward the submission.
    let toSend = chips;
    if (draft.trim()) {
      if (!commitDraft(draft)) return;
      setDraft('');
      toSend = [...chips, draft.trim().replace(/,$/, '')];
    }

    if (toSend.length === 0) {
      setError('Add at least one email');
      return;
    }

    startTransition(async () => {
      const sent: string[] = [];
      const failed: { email: string; error: string }[] = [];
      for (const email of toSend) {
        const fd = new FormData();
        fd.set('email', email);
        const res = await inviteMemberAction({ error: null, ok: null }, fd);
        if (res.ok) sent.push(email);
        else failed.push({ email, error: res.error ?? 'Failed' });
      }
      setResult({ sent, failed });
      if (failed.length === 0) {
        setChips([]);
      } else {
        // Keep the ones that failed so the owner can retry.
        setChips(failed.map((f) => f.email));
      }
    });
  };

  const triggerNode = trigger ?? (
    <button
      type="button"
      className="mb-2 flex w-full items-center gap-2.5 rounded-md border border-line bg-overlay px-3 py-2 text-sm text-neutral-200 transition-colors hover:border-line-strong hover:bg-overlay hover:text-fg-strong"
    >
      <UserPlus className="h-4 w-4 text-neutral-400" />
      <span>Invite teammates</span>
    </button>
  );

  // Pre-hydration: bare trigger only; the live dialog mounts next tick.
  if (!mounted) return <>{triggerNode}</>;

  return (
    <SmoothDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <SmoothDialogTrigger asChild>{triggerNode}</SmoothDialogTrigger>
      <SmoothDialogContent>
        <SmoothDialogHeader>
          <SmoothDialogTitle>
            Invite teammates to your workspace
          </SmoothDialogTitle>
          <SmoothDialogDescription>
            They&rsquo;ll get an email with a link that expires in 7 days. Make
            sure they sign in with the same address.
          </SmoothDialogDescription>
        </SmoothDialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="invite-emails"
              className="mb-2 block text-sm font-medium text-neutral-200"
            >
              Invite your coworkers
            </label>
            <div
              onClick={() => inputRef.current?.focus()}
              className="flex min-h-[3.25rem] flex-wrap items-center gap-1.5 rounded-lg border border-line bg-neutral-950 px-2 py-2 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
            >
              {chips.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 rounded-md bg-blue-500/15 px-2 py-1 text-sm text-blue-100 ring-1 ring-blue-500/30"
                >
                  {email}
                  <button
                    type="button"
                    onClick={() => removeChip(email)}
                    aria-label={`Remove ${email}`}
                    className="rounded-sm text-blue-200/80 hover:text-fg-strong"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
              <input
                ref={inputRef}
                id="invite-emails"
                type="email"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onBlur={() => {
                  if (draft.trim() && commitDraft(draft)) setDraft('');
                }}
                placeholder={chips.length === 0 ? 'Add emails' : ''}
                className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
              />
            </div>
            <p className="mt-1.5 text-xs text-neutral-500">
              Separate emails with a space, comma, or enter.
            </p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {result && (
            <div className="space-y-1 text-sm">
              {result.sent.length > 0 && (
                <p className="text-emerald-400">
                  Sent {result.sent.length}{' '}
                  {result.sent.length === 1 ? 'invite' : 'invites'}.
                </p>
              )}
              {result.failed.length > 0 && (
                <ul className="space-y-0.5 text-red-400">
                  {result.failed.map((f) => (
                    <li key={f.email}>
                      {f.email}: {f.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <SmoothButton
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Cancel
            </SmoothButton>
            <SmoothButton
              type="submit"
              disabled={isPending || (chips.length === 0 && !draft.trim())}
            >
              {isPending ? 'Sending…' : 'Send Invites'}
            </SmoothButton>
          </div>
        </form>
      </SmoothDialogContent>
    </SmoothDialog>
  );
}
