'use client';

import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Server } from 'lucide-react';
import { X_URL } from '@/lib/marketing/constants';
import { track } from '@/lib/marketing/track';
import { useMessages } from './i18n-provider';

// X_URL is the repo URL despite the legacy name. The self-hosted plan ships no
// prebuilt binary — visitors clone and build the macOS app themselves — so the
// CTA points at the repo rather than at a DMG.
const GITHUB_REPO_URL = X_URL;

// Free / self-hosted pricing card. The Server badge uses the lucide icon, not
// the Material Symbols <Icon>: the marketing icon font is a ligature SUBSET, and
// a name that isn't in it renders as raw literal text.
export function FreeCard() {
  const m = useMessages();
  const f = m.pricing.free;

  return (
    <div className="rounded-xl bg-white p-12 ring-1 ring-black/10">
      {/* min-h-8 matches the Managed card's badge-row height so both cards'
          titles, prices, and CTAs stay aligned side by side. */}
      <div className="mb-4 flex min-h-8 items-center gap-2">
        <Badge className="border-0 bg-neutral-200 text-neutral-900 hover:bg-neutral-200 gap-1 text-xs sm:text-sm">
          <Server size={14} />
          {f.badge}
        </Badge>
        <Badge className="border-0 bg-neutral-200 text-neutral-900 hover:bg-neutral-200 text-xs sm:text-sm">
          {f.badgeFree}
        </Badge>
      </div>
      <h3 className="text-2xl font-bold sm:text-3xl">{f.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground sm:text-base">
        {f.tagline}
      </p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-foreground tabular-nums sm:text-5xl">
          {f.price}
        </span>
        <span className="font-mono text-xs text-muted-foreground sm:text-sm">
          {f.period}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{f.note}</p>

      <a
        href={GITHUB_REPO_URL}
        onClick={() => track('source_opened', { from: 'pricing_free' })}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-neutral-900 px-7 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black/20 sm:text-base"
      >
        {f.cta}
      </a>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {m.pricing.guarantee}
      </p>

      <Separator className="my-5" />
      <ul className="space-y-3.5">
        {f.features.map((label) => (
          <li
            key={label}
            className="flex items-center gap-3 text-sm sm:text-base"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-black/15">
              <Icon name="check" size={14} className="text-foreground" />
            </span>
            <span className="text-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
