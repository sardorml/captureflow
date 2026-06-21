'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import CtaButton from '@/components/ui/cta-button';
import { cn } from '@/lib/utils';
import { track } from '@/lib/marketing/track';
import { useMessages } from './i18n-provider';

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
    setLoading(true);
    setError(null);
    const form = e.currentTarget;
    const email = (new FormData(form).get('email') as string | null)?.trim();
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? m.waitlist.errors.joinFailed);
        setLoading(false);
        return;
      }
      // Only count a join the API actually accepted.
      track('waitlist_joined');
      setSubmitted(true);
    } catch {
      setError(m.waitlist.errors.network);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700',
          className,
        )}
      >
        <Icon name="check" size={16} />
        {m.waitlist.success}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'flex w-full max-w-md flex-col items-stretch gap-2',
        className,
      )}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <input
          name="email"
          type="email"
          required
          aria-label={m.waitlist.emailPlaceholder}
          placeholder={m.waitlist.emailPlaceholder}
          className="h-12 w-full rounded-lg border border-black/10 bg-white px-4 text-base text-foreground placeholder:text-neutral-500 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 sm:flex-1"
        />
        <CtaButton
          type="submit"
          disabled={loading}
          size="lg"
          className="w-full whitespace-nowrap px-6 sm:w-auto"
        >
          {loading ? m.waitlist.buttonLoading : m.waitlist.buttonDefault}
        </CtaButton>
      </div>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <p className="text-sm text-muted-foreground">
        {m.waitlist.earlyAccessPrompt}{' '}
        <Link
          href="/beta-tester"
          className="text-blue-700 underline underline-offset-2 transition-colors hover:text-blue-600"
        >
          {m.waitlist.earlyAccessLink}
        </Link>
        .
      </p>
    </form>
  );
}
