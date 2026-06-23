'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lightbulb } from 'lucide-react';
import { PageShell } from '@/components/marketing/page-shell';
import SmoothButton from '@/components/ui/smooth-button';
import { FEATURE_CATEGORIES, SUPPORT_EMAIL } from '@/lib/marketing/constants';
import {
  useMessages,
  useLocalizedHref,
} from '@/components/marketing/i18n-provider';

// The token-less `ajax/<email>` endpoint means FormSubmit sends a one-time
// confirmation email to SUPPORT_EMAIL on the first submission; once confirmed,
// later submissions deliver silently.
const FORMSUBMIT_URL = `https://formsubmit.co/ajax/${SUPPORT_EMAIL}`;

// Split out from page.tsx so the route can stay a Server Component and export
// `metadata` (Next.js disallows a metadata export from a 'use client' module).
// The success-state bulb is a lucide glyph, not the Material Symbols <Icon>:
// the marketing icon font is a ligature subset missing `lightbulb`, which would
// otherwise render as literal text.
export function SuggestFeatureClient() {
  const m = useMessages();
  const lh = useLocalizedHref();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [category, setCategory] = useState<string>('');
  const errorParts = m.suggestFeature.errorBody.split('{email}');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = e.currentTarget;
    // Success is only shown on a confirmed 2xx from the relay — a failed
    // delivery must surface the direct-email fallback, never a fake success.
    try {
      const res = await fetch(FORMSUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...Object.fromEntries(new FormData(form)),
          category,
        }),
      });
      if (!res.ok) {
        setError(true);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      maxWidth="max-w-xl"
      title={submitted ? undefined : m.suggestFeature.title}
      subtitle={submitted ? undefined : m.suggestFeature.subtitle}
    >
      {submitted ? (
        <div className="text-center py-16">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
            <Lightbulb className="h-7 w-7 text-amber-500" />
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {m.suggestFeature.successTitle}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {m.suggestFeature.successBody}
          </p>
          <SmoothButton asChild size="lg" className="mt-8">
            <Link href={lh('/')}>{m.pageShell.backToHome}</Link>
          </SmoothButton>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="hidden"
            name="_subject"
            value="New feature suggestion (CaptureFlow)"
          />
          <input type="hidden" name="_template" value="table" />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                {m.forms.name}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder={m.forms.namePlaceholder}
                className="w-full rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-base text-foreground placeholder:text-neutral-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium"
              >
                {m.forms.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={m.forms.emailPlaceholder}
                className="w-full rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-base text-foreground placeholder:text-neutral-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <span
              id="category-label"
              className="mb-1.5 block text-sm font-medium"
            >
              {m.suggestFeature.categoryLabel}
            </span>
            <div
              role="radiogroup"
              aria-labelledby="category-label"
              className="flex flex-wrap gap-2"
            >
              {FEATURE_CATEGORIES.map((cat, index) => (
                <button
                  key={cat}
                  type="button"
                  role="radio"
                  aria-checked={category === cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                    category === cat
                      ? 'bg-blue-600 text-white font-medium'
                      : 'border border-black/10 bg-black/[0.02] text-muted-foreground hover:text-foreground hover:border-black/20'
                  }`}
                >
                  {m.suggestFeature.categoryOptions[index]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium">
              {m.suggestFeature.featureTitleLabel}
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder={m.suggestFeature.featureTitlePlaceholder}
              className="w-full rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-base text-foreground placeholder:text-neutral-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-1.5 block text-sm font-medium"
            >
              {m.suggestFeature.descriptionLabel}
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={6}
              placeholder={m.suggestFeature.descriptionPlaceholder}
              className="w-full resize-none rounded-lg border border-black/10 bg-black/[0.02] px-4 py-3 text-base text-foreground placeholder:text-neutral-400 outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <SmoothButton
            type="submit"
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                {m.forms.submitting}
              </span>
            ) : (
              m.suggestFeature.submit
            )}
          </SmoothButton>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {errorParts[0]}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                {SUPPORT_EMAIL}
              </a>
              {errorParts[1]}
            </p>
          )}
          <p className="text-center text-xs text-neutral-500">
            {m.suggestFeature.deliveredVia}
          </p>
        </form>
      )}
    </PageShell>
  );
}
