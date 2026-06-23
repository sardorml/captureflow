'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { Check, Sparkles } from 'lucide-react';
import {
  SmoothButton,
  SmoothDialog,
  SmoothDialogContent,
  SmoothDialogDescription,
  SmoothDialogHeader,
  SmoothDialogTitle,
  SmoothDialogTrigger,
} from '@captureflow/ui';

// Pricing is kept inline (not pulled from the landing package) so the
// dashboard build stays self-contained. The Lemon Squeezy checkout base
// comes from a single public env var; when it's unset the buy button is
// hidden but the modal still renders its pricing/feature view.

const MONTHLY_PRICE = 9;

const CHECKOUT_BASE_URL =
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ?? '';

const BENEFITS = [
  '200 GB cloud storage (up from 200 MB)',
  'No cap on the number of shares & Snaps',
  'Automatic backups & monitoring',
  'Priority support',
] as const;

type Props = {
  // Pre-fills the LS checkout via `?checkout[email]=`, which LS then locks.
  email: string;
  // Caller-supplied trigger, handed to Radix's `asChild` Slot.
  trigger: ReactNode;
};

// Builds the checkout URL from the configured base. `billing=monthly` lets a
// deployer branch on it in their LS product; email pre-fills the LS form.
// Returns null when no base is configured so callers can hide the buy button.
function checkoutUrlFor(email: string): string | null {
  if (!CHECKOUT_BASE_URL) return null;
  const u = new URL(CHECKOUT_BASE_URL);
  u.searchParams.set('billing', 'monthly');
  if (email) u.searchParams.set('checkout[email]', email);
  return u.toString();
}

export function UpgradeModal({ email, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const price = MONTHLY_PRICE;
  const checkoutUrl = checkoutUrlFor(email);

  // Radix's `asChild` Slot injects a generated id on the client; rendering the
  // wired-up trigger during SSR produces a useId the client can't reproduce, so
  // hydration fails (which also disables Fast Refresh). Render the bare trigger
  // until mounted, then swap in the live dialog so SSR and first client render
  // match exactly.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  if (!mounted) return <>{trigger}</>;

  return (
    <SmoothDialog open={open} onOpenChange={setOpen}>
      <SmoothDialogTrigger asChild>{trigger}</SmoothDialogTrigger>
      <SmoothDialogContent className="sm:max-w-lg">
        <SmoothDialogHeader>
          <SmoothDialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-500" />
            Upgrade to CaptureFlow Pro
          </SmoothDialogTitle>
          <SmoothDialogDescription>
            More cloud storage for your shares and Snaps. Cancel any time.
          </SmoothDialogDescription>
        </SmoothDialogHeader>

        {/* Price headline + cadence footnote. */}
        <div className="mt-5">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums text-fg">
              ${price}
            </span>
            <span className="text-sm text-fg-subtle">/month</span>
          </div>
          <p className="mt-1 text-xs text-fg-subtle">
            Billed monthly. Cancel anytime.
          </p>
        </div>

        {/* Benefit list */}
        <ul className="mt-4 space-y-2">
          {BENEFITS.map((b) => (
            <li key={b} className="flex items-center gap-2.5 text-sm text-fg">
              <Check className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {checkoutUrl ? (
          <SmoothButton
            variant="candy"
            size="lg"
            asChild
            className="mt-6 w-full"
          >
            <a href={checkoutUrl} target="_blank" rel="noopener noreferrer">
              <Sparkles className="h-4 w-4" />
              Upgrade now
            </a>
          </SmoothButton>
        ) : (
          <p className="mt-6 text-center text-xs text-fg-subtle">
            Checkout isn&apos;t configured for this deployment.
          </p>
        )}
      </SmoothDialogContent>
    </SmoothDialog>
  );
}
