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

const MONTHLY_PRICE = 9;

// NEXT_PUBLIC_* aren't inlined into client bundles here, so hardcode the public
// checkout link; the env still wins when present.
const CHECKOUT_BASE_URL =
  process.env.NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL ||
  'https://sardorml.lemonsqueezy.com/checkout/buy/775fbd57-6dea-4dee-9b27-4cc8aa664916';

const BENEFITS = [
  '200 GB cloud storage (up from 200 MB)',
  'No cap on the number of shares & Snaps',
  'Automatic backups & monitoring',
  'Priority support',
] as const;

type Props = {
  email: string;
  trigger: ReactNode;
};

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

  // Radix's asChild Slot injects a generated id only on the client, so render
  // the bare trigger until mounted to keep SSR and first client render matching.
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
