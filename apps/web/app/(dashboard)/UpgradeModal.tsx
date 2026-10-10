"use client";

import { useState, type ReactElement } from "react";
import { useSearchParams } from "next/navigation";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@heroui/react";
import { ManagedIncludes } from "@/components/marketing/managed-card";
import { MANAGED_TIERS, SUPPORT_EMAIL } from "@/lib/marketing/constants";
import { MESSAGES } from "@/lib/marketing/messages";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";

const copy = MESSAGES.pricing.managed;
const enterprise = MESSAGES.pricing.enterprise;
const ENTERPRISE_HREF = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(enterprise.subject)}`;

type Props = {
  email: string;
  userId: string;
  // Rendered as a child, never cloned — see the wrapper below. Stays an
  // element (not a render prop) because server components render this and
  // functions can't cross that boundary.
  trigger: ReactElement;
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
  const [choice, setChoice] = useState<number | "enterprise">(
    (MANAGED_TIERS.find((t) => t.tag === "recommended") ?? MANAGED_TIERS[0])
      .storageGb,
  );
  const selected =
    MANAGED_TIERS.find((t) => t.storageGb === choice) ?? MANAGED_TIERS[0];
  const isEnterprise = choice === "enterprise";
  const rows = [
    ...MANAGED_TIERS.map((t) => ({
      key: t.storageGb,
      label: t.label,
      price: `$${t.price}/mo`,
    })),
    {
      key: "enterprise" as const,
      label: enterprise.name,
      price: enterprise.price,
    },
  ];

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
      {/*
       * Rendered, never cloned. React can hand a server-created element to a
       * client component as a lazy reference, and cloneElement reads `.type`
       * off that wrapper — undefined, which takes the whole page down with
       * "Element type is invalid". Capture phase, because React Aria's
       * usePress calls stopPropagation() on click.
       */}
      <span className="contents" onClickCapture={() => setOpen(true)}>
        {trigger}
      </span>
      <Modal isOpen={open} onOpenChange={setOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            {/* The dialog is the landing's managed card: blue plan panel on
                the left, what's included on the right. */}
            <Modal.Dialog className="max-w-3xl rounded-2xl bg-panel p-2">
              {/* This dialog has no footer action, so the X is the only
                  in-dialog way out. Positions itself top-right. */}
              <Modal.CloseTrigger />
              <Modal.Body className="grid gap-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                {/* Dark in both themes, and says so: light mode inverts the
                    neutral ramp, which turned the dark text on its white
                    button white on white. */}
                <div
                  data-theme="dark"
                  className="flex flex-col overflow-hidden rounded-xl bg-accent-bg p-6"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-lg bg-white/15 text-white">
                      <Cloud size={14} />
                    </span>
                    <span className="text-sm font-medium text-white/80">
                      {copy.badge}
                    </span>
                  </span>
                  <Modal.Heading className="mt-3 text-xl font-semibold tracking-[-0.01em] text-white">
                    {copy.title}
                  </Modal.Heading>

                  <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-white">
                    <span
                      key={isEnterprise ? "enterprise" : selected.price}
                      className="animate-storage-pop inline-block"
                    >
                      {isEnterprise ? "Custom" : `$${selected.price}`}
                    </span>
                    {isEnterprise ? null : (
                      <span className="ms-1 align-baseline text-base font-normal text-white/70">
                        {copy.period}
                      </span>
                    )}
                  </p>
                  <p className="mt-1.5 text-sm text-white/60">
                    {isEnterprise ? enterprise.note : copy.paidNote}
                  </p>

                  <div
                    role="radiogroup"
                    aria-label={copy.tiersLabel}
                    className="mt-5 mb-5 grid gap-1"
                  >
                    {rows.map((row) => {
                      const isOn = row.key === choice;
                      return (
                        <button
                          key={row.key}
                          type="button"
                          role="radio"
                          aria-checked={isOn}
                          onClick={() => setChoice(row.key)}
                          className={cn(
                            "flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                            isOn
                              ? "bg-white/20 text-white"
                              : "text-white/75 hover:bg-white/10 hover:text-white",
                          )}
                        >
                          <span className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "flex size-4 items-center justify-center rounded-full border",
                                isOn
                                  ? "border-white bg-white"
                                  : "border-white/50",
                              )}
                            >
                              {isOn ? (
                                <span className="size-1.5 rounded-full bg-accent-bg" />
                              ) : null}
                            </span>
                            <span className="font-medium">{row.label}</span>
                          </span>
                          <span className="tabular-nums">{row.price}</span>
                        </button>
                      );
                    })}
                  </div>

                  <a
                    href={
                      isEnterprise
                        ? ENTERPRISE_HREF
                        : checkoutUrlFor(selected.checkoutUrl, email, userId)
                    }
                    target={isEnterprise ? undefined : "_blank"}
                    rel={isEnterprise ? undefined : "noopener noreferrer"}
                    onClick={
                      isEnterprise
                        ? () =>
                            track("marketing_cta_clicked", {
                              location: "upgrade_enterprise",
                            })
                        : handleCheckoutClick
                    }
                    className="flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-white text-sm font-medium text-neutral-900 transition-colors hover:bg-white/90 motion-reduce:transition-none"
                  >
                    {isEnterprise
                      ? enterprise.cta
                      : copy.ctaUpgrade.replace("{storage}", selected.label)}
                  </a>
                </div>

                <ManagedIncludes copy={copy} />
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
