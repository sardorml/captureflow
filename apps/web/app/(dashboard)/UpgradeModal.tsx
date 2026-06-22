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

// Pricing details — kept inline (rather than pulled from the landing
// package) so the dashboard build stays self-contained. The Lemon
// Squeezy checkout base lives in a single public env var; deployers
// point it at their own LS product. When it's unset, the buy button
// is hidden so the modal still renders its pricing/feature view.

// Entry tier — the managed plan starts at 100 GB; larger tiers live on the site.
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
  // Email pre-fills the LS checkout so signed-in dashboard users
  // don't re-type. LS reads `?checkout[email]=` and locks the field.
  email: string;
  // Custom trigger so callers can drop this into any chrome — the
  // TopBar passes its existing candy "Upgrade" button asChild.
  trigger: ReactNode;
};

// Builds the checkout URL from the single configured base. A `billing=monthly`
// query param is set so a deployer can branch on it in their LS product (or
// ignore it); email pre-fills the LS form. When no base is configured, returns
// null so callers hide the buy button.
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

  // The trigger is authored by the caller (the TopBar builds the candy
  // "Upgrade" button) and handed to Radix's `asChild` Slot, which injects
  // aria/data attributes + a generated id on the client. Rendering that
  // wired-up trigger during SSR produces a useId the client can't reproduce
  // 1:1, so hydration fails — and a failed hydration disables Fast Refresh.
  // Render the bare trigger until mounted, then swap in the live dialog so
  // the server and first client render match exactly.
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
