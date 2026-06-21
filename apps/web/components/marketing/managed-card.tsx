'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MONTHLY_PRICE,
  ANNUAL_PRICE_PER_MONTH,
  ANNUAL_SAVINGS_PERCENT,
  MONTHLY_SUBSCRIPTION_CHECKOUT_URL,
  ANNUAL_SUBSCRIPTION_CHECKOUT_URL,
} from '@/lib/marketing/constants';
import { getPosthogDistinctId, track } from '@/lib/marketing/track';
import { useMessages } from './i18n-provider';

type Cycle = 'monthly' | 'annual';

// Per-cycle pricing + checkout. Annual quotes a per-month figure (the footnote
// states the once-a-year charge); each cycle has its own checkout URL so the
// purchase lands on the right plan.
const CYCLES: Record<
  Cycle,
  { price: number; checkout: string | undefined; utm: string }
> = {
  monthly: {
    price: MONTHLY_PRICE,
    checkout: MONTHLY_SUBSCRIPTION_CHECKOUT_URL,
    utm: 'monthly',
  },
  annual: {
    price: ANNUAL_PRICE_PER_MONTH,
    checkout: ANNUAL_SUBSCRIPTION_CHECKOUT_URL,
    utm: 'annual',
  },
};

// Managed card — the dark, highlighted paid plan, and the second card. A single
// card now carries BOTH billing cycles: the cadence badge is a Monthly/Annual
// switch that flips the price, footnote, and checkout link in place (replacing
// the old pair of separate monthly + annual cards). The -33% badge advertises
// the annual saving so there's a visible reason to toggle.
export function ManagedCard() {
  const m = useMessages();
  const [cycle, setCycle] = useState<Cycle>('monthly');

  // Cadence copy comes from the existing monthly/annual catalog blocks; only
  // the cadence, price, footnote, and checkout differ between cycles.
  const copy = cycle === 'monthly' ? m.pricing.monthly : m.pricing.annual;
  const { price, checkout, utm } = CYCLES[cycle];

  const baseHref = checkout
    ? `${checkout}?utm_source=site&utm_medium=pricing&utm_content=${utm}`
    : '#pricing';

  // PostHog distinct_id is appended at CLICK time (it doesn't exist on the
  // server at render) so the signup flow can stitch the purchase back to the
  // web session.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track('checkout_opened', { cycle });
    if (!checkout) return;
    const distinctId = getPosthogDistinctId();
    if (!distinctId) return; // plain attributed href still works
    try {
      const url = new URL(e.currentTarget.href);
      url.searchParams.set('checkout[custom][ph_distinct_id]', distinctId);
      e.currentTarget.href = url.toString();
    } catch {
      // Malformed URL — keep the plain href rather than block the click.
    }
  };

  const note =
    cycle === 'annual'
      ? m.pricing.annual.note.replace(
          '{amount}',
          `$${ANNUAL_PRICE_PER_MONTH * 12}`,
        )
      : m.pricing.monthly.note;

  return (
    <div className="rounded-xl bg-neutral-900 p-12 text-white">
      {/* min-h-8 matches the Free card's badge row so both columns stay
          aligned; the cadence switch is sized to fit within it. flex-wrap lets
          the row reflow on very narrow cards rather than overflow. */}
      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-1.5">
        <Badge className="bg-white/10 text-white hover:bg-white/10 gap-1 text-xs">
          <Icon name="workspace_premium" size={14} fill />
          {m.pricing.monthly.badgePro}
        </Badge>

        {/* Cadence switch — the old "Monthly" cycle badge, now a two-segment
            toggle that flips the price / footnote / checkout in place. Sized
            text-xs with tight padding so the row (Managed + switch + the wider
            "Annual -33%" badge) stays on ONE line — a wrap would grow this row
            taller than the Free card's and break their alignment. */}
        <div
          role="group"
          aria-label="Billing cycle"
          className="inline-flex items-center rounded-full bg-white/10 p-0.5 text-xs"
        >
          {(['monthly', 'annual'] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCycle(c)}
              aria-pressed={cycle === c}
              className={`rounded-full px-2.5 py-1 font-medium transition-colors ${
                cycle === c
                  ? 'bg-white text-neutral-900'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {c === 'monthly'
                ? m.pricing.monthly.badgeCycle
                : m.pricing.annual.badgeCycle}
            </button>
          ))}
        </div>

        {/* Names the cycle the saving applies to, so it reads as "the annual
            plan is 33% off" even when Monthly is the active segment. text-xs
            keeps the wider label from forcing the badge row to wrap (which would
            break the Free/Managed card alignment). */}
        <Badge className="bg-blue-500/30 text-blue-200 hover:bg-blue-500/30 text-xs font-semibold">
          Annual -{ANNUAL_SAVINGS_PERCENT}%
        </Badge>
      </div>

      <h3 className="text-3xl font-bold text-white">
        {m.pricing.monthly.title}
      </h3>
      <p className="mt-1 text-base text-neutral-400">{copy.subtitle}</p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white tabular-nums">
          ${price}
        </span>
        <span className="font-mono text-sm text-neutral-400">
          {copy.period}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-400">{note}</p>

      <a
        href={baseHref}
        onClick={handleCheckoutClick}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-2xl bg-white px-7 text-base font-semibold text-neutral-900 transition-colors hover:bg-white/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/40"
      >
        {copy.cta}
      </a>
      <p className="mt-3 text-center text-xs text-neutral-400">
        {m.pricing.guarantee}
      </p>

      <Separator className="my-5 bg-white/10" />
      <ul className="space-y-3.5">
        {[
          m.pricing.highlights.allFeatures,
          m.pricing.highlights.shareableLinks,
        ].map((label) => (
          <li key={label} className="flex items-center gap-3 text-base">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full ring-1 ring-white/15">
              <Icon name="check" size={14} className="text-white" />
            </span>
            <span className="text-white">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
