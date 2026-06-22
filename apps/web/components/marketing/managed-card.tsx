'use client';

import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MONTHLY_PRICE,
  MONTHLY_SUBSCRIPTION_CHECKOUT_URL,
} from '@/lib/marketing/constants';
import { getPosthogDistinctId, track } from '@/lib/marketing/track';
import { useMessages } from './i18n-provider';

// Managed card — the dark, highlighted paid plan, and the second card. A single
// monthly price (the annual cycle was removed): the price, footnote, and
// checkout come straight from the monthly catalog block.
export function ManagedCard() {
  const m = useMessages();
  const copy = m.pricing.monthly;

  const baseHref = MONTHLY_SUBSCRIPTION_CHECKOUT_URL
    ? `${MONTHLY_SUBSCRIPTION_CHECKOUT_URL}?utm_source=site&utm_medium=pricing&utm_content=monthly`
    : '#pricing';

  // PostHog distinct_id is appended at CLICK time (it doesn't exist on the
  // server at render) so the signup flow can stitch the purchase back to the
  // web session.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track('checkout_opened', { cycle: 'monthly' });
    if (!MONTHLY_SUBSCRIPTION_CHECKOUT_URL) return;
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

  return (
    <div className="rounded-xl bg-neutral-900 p-12 text-white">
      {/* min-h-8 matches the Free card's badge row so both columns stay
          aligned. */}
      <div className="mb-4 flex min-h-8 flex-wrap items-center gap-1.5">
        <Badge className="bg-white/10 text-white hover:bg-white/10 gap-1 text-xs">
          <Icon name="workspace_premium" size={14} fill />
          {copy.badgePro}
        </Badge>
      </div>

      <h3 className="text-3xl font-bold text-white">{copy.title}</h3>
      <p className="mt-1 text-base text-neutral-400">{copy.subtitle}</p>

      <div className="mt-5 flex items-baseline gap-2">
        <span className="text-5xl font-bold text-white tabular-nums">
          ${MONTHLY_PRICE}
        </span>
        <span className="font-mono text-sm text-neutral-400">{copy.period}</span>
      </div>
      <p className="mt-1 text-sm text-neutral-400">{copy.note}</p>

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

      {/* Storage tiers are expanding — signal that 100 GB isn't the ceiling.
          Plain dot instead of a Material <Icon>: the marketing icon font is a
          ligature subset and a "soon"/"schedule" glyph would leak as text. */}
      <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-300">
        <span aria-hidden className="size-1.5 rounded-full bg-blue-400" />
        More storage options coming soon
      </div>
    </div>
  );
}
