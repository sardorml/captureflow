"use client";

import { cloneElement, useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Cloud, Sparkles } from "lucide-react";
import { Modal } from "@heroui/react";
import { MANAGED_TIERS } from "@/lib/marketing/constants";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";

const BENEFITS = [
  "No cap on the number of recordings & Screenshots",
  "Automatic backups & monitoring",
  "Priority support",
] as const;

type Props = {
  email: string;
  userId: string;
  /*
   * Cloned with an onPress rather than wrapped in an onClick handler: React
   * Aria's usePress calls stopPropagation() on click, so an ancestor's onClick
   * never fires. Stays an element (not a render prop) because server components
   * render this and functions can't cross that boundary.
   */
  trigger: ReactElement<{ onPress?: () => void }>;
  // Auto-opens when the URL has ?upgrade — the landing/pricing tiers send
  // signed-out buyers through /login?mode=signup&next=/recordings?upgrade=1. Enable on
  // one instance per page or they all pop.
  openOnUpgradeParam?: boolean;
};

// checkout[custom][user_id] is what the lemon-webhook attaches the
// subscription by; the email prefill is UX only and the buyer can edit it.
function checkoutUrlFor(base: string, email: string, userId: string): string {
  const u = new URL(base);
  if (email) u.searchParams.set("checkout[email]", email);
  u.searchParams.set("checkout[custom][user_id]", userId);
  return u.toString();
}

export function UpgradeModal({
  email,
  userId,
  trigger,
  openOnUpgradeParam = false,
}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(
    () => openOnUpgradeParam && searchParams.has("upgrade"),
  );

  // Opens on the recommended tier; the price and the checkout link both follow
  // the switch, so what's shown is always what the button buys.
  const [storageGb, setStorageGb] = useState(
    (MANAGED_TIERS.find((t) => t.tag === "recommended") ?? MANAGED_TIERS[0])
      .storageGb,
  );
  const selected =
    MANAGED_TIERS.find((t) => t.storageGb === storageGb) ?? MANAGED_TIERS[0];

  // PostHog distinct_id isn't available server-side at render, so append it
  // at click time.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("checkout_opened", { plan: "managed" });
    const distinctId = getPosthogDistinctId();
    if (!distinctId) return;
    try {
      const url = new URL(e.currentTarget.href);
      url.searchParams.set("checkout[custom][ph_distinct_id]", distinctId);
      e.currentTarget.href = url.toString();
    } catch {
      // Malformed URL — keep the plain href rather than block the click.
    }
  };

  return (
    <>
      {cloneElement(trigger, { onPress: () => setOpen(true) })}
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop>
          <Modal.Container size="md">
            <Modal.Dialog>
              {/* This dialog has no footer action, so the X is the only
                  in-dialog way out. Positions itself top-right. */}
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="inline-flex items-center gap-2">
                  <Sparkles size={16} />
                  Upgrade to CaptureFlow Pro
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {/* Same shape as the managed card on /plan: a tinted panel
                    carrying the switch, price, and CTA, with the benefits
                    listed below it on the dialog surface. The panel is dark in
                    both themes, so its text is fixed white. */}
                <div className="flex flex-col overflow-hidden rounded-xl bg-[radial-gradient(120%_100%_at_15%_0%,#2f5bd8_0%,#1b2f73_55%,#131c38_100%)] p-5">
                  {/* The switch rides the badge row, which is otherwise empty,
                      so it costs the panel no extra height. */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
                        <Cloud size={14} />
                      </span>
                      <span className="text-sm font-medium text-white/80">
                        Managed
                      </span>
                    </span>

                    <div
                      role="radiogroup"
                      aria-label="Cloud storage"
                      className="flex shrink-0 items-center gap-0.5 rounded-full bg-white/10 p-0.5"
                    >
                      {MANAGED_TIERS.map((tier) => {
                        const on = tier.storageGb === storageGb;
                        return (
                          <button
                            key={tier.storageGb}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => setStorageGb(tier.storageGb)}
                            className={[
                              "cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors motion-reduce:transition-none",
                              on
                                ? "bg-white text-neutral-900"
                                : "text-white/70 hover:text-white",
                            ].join(" ")}
                          >
                            {tier.storageGb} GB
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white">
                    Managed hosting
                  </h3>
                  <p className="mt-1 max-w-72 text-sm leading-snug text-white/70">
                    {selected.storageGb} GB of cloud storage for your recordings
                    and Screenshots.
                  </p>

                  <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-white">
                    ${selected.price}
                    <span className="ms-1 align-baseline text-base font-normal text-white/70">
                      /month
                    </span>
                  </p>
                  <p className="mt-1.5 mb-5 text-sm text-white/60">
                    Billed monthly. Cancel anytime.
                  </p>

                  <a
                    href={checkoutUrlFor(selected.checkoutUrl, email, userId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleCheckoutClick}
                    className="flex h-10 w-full shrink-0 items-center justify-center rounded-xl bg-white text-sm font-medium text-neutral-900 transition-colors hover:bg-white/90 motion-reduce:transition-none"
                  >
                    Continue to checkout
                  </a>
                </div>

                <ul className="flex list-none flex-col gap-2.5 px-1 pt-5 pb-1">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-center gap-3">
                      <span className="shrink-0 text-fg-subtle">
                        <Check size={16} />
                      </span>
                      <span className="text-sm text-fg-muted">{b}</span>
                    </li>
                  ))}
                </ul>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
