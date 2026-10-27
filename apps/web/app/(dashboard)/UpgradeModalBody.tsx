"use client";

import { useState } from "react";
import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@heroui/react";
import {
  GRADIENT_BORDER,
  PlanIncludes,
} from "@/components/marketing/plan-cards";
import { MESSAGES } from "@/lib/marketing/messages";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";
import {
  SEAT_ANNUAL_SAVING_PERCENT,
  SEAT_PLAN,
  seatPriceUsd,
} from "@captureflow/quota";
import {
  seatCheckoutUrl,
  type SeatCycle,
  type SeatOffer,
} from "@/lib/billing/seat-checkout";

const includes = MESSAGES.pricing.includes;

type Props = {
  email: string;
  userId: string;
  seat: SeatOffer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/*
 * Per-seat plan: one price per member, shown as the workspace's monthly total
 * so the buyer sees the number that will appear on the invoice. The seat
 * count is prefilled from the member count and adjusts as people join.
 */
function SeatPlanPanel({
  seat,
  email,
  userId,
  onCheckout,
}: {
  seat: SeatOffer;
  email: string;
  userId: string;
  onCheckout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const [cycle, setCycle] = useState<SeatCycle>("monthly");
  const seats = Math.max(1, seat.memberCount);
  const perSeat =
    cycle === "annual"
      ? SEAT_PLAN.priceAnnualUsdPerMonth
      : SEAT_PLAN.priceMonthlyUsd;
  const total = seatPriceUsd(seats, cycle);
  const href = seat.checkoutUrl
    ? seatCheckoutUrl({
        base: seat.checkoutUrl,
        email,
        userId,
        workspaceId: seat.workspaceId,
        seats,
      })
    : null;
  const cycles: { key: SeatCycle; label: string }[] = [
    { key: "monthly", label: "Monthly" },
    { key: "annual", label: "Yearly" },
  ];

  return (
    <div className={cn("rounded-2xl p-0.5", GRADIENT_BORDER)}>
      <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))] p-6 text-fg">
        <span className="inline-flex w-fit items-center rounded-lg bg-accent/15 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-accent uppercase">
          Most popular
        </span>
        <Modal.Heading className="mt-3 flex items-start gap-1 text-2xl font-bold tracking-[-0.02em] text-fg">
          {SEAT_PLAN.name}
          <Sparkle size={14} className="shrink-0 fill-current text-fg" />
        </Modal.Heading>
        <p className="mt-1 text-sm text-fg-muted">
          Upgrade {seat.workspaceName}
        </p>

        <p className="mt-4 text-4xl font-bold tracking-[-0.02em] text-fg">
          <span
            key={`${cycle}-${total}`}
            className="animate-storage-pop inline-block"
          >
            ${total}
          </span>
          <span className="ms-1 align-baseline text-base font-normal text-fg-muted">
            /month
          </span>
        </p>
        <p className="mt-1.5 text-sm text-fg-muted">
          ${perSeat} per member × {seats} {seats === 1 ? "member" : "members"}
          {cycle === "annual" ? ", billed yearly" : ", billed monthly"}. Adding
          a member adds a seat; removing one drops it at renewal.
        </p>

        <div
          role="radiogroup"
          aria-label="Billing cycle"
          className="mt-5 mb-5 grid grid-cols-2 gap-1 rounded-lg bg-tint p-1"
        >
          {cycles.map((c) => {
            const isOn = c.key === cycle;
            return (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={isOn}
                onClick={() => setCycle(c.key)}
                className={cn(
                  "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none",
                  isOn
                    ? "bg-panel text-fg shadow-sm"
                    : "text-fg-muted hover:text-fg",
                )}
              >
                {c.label}
                {c.key === "annual" ? (
                  <span className="ms-1.5 text-xs opacity-80">
                    save {SEAT_ANNUAL_SAVING_PERCENT}%
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <ul className="mb-5 grid gap-1.5 text-sm text-fg">
          <li>Unlimited recordings, any length, full quality</li>
          <li>
            {Math.round(SEAT_PLAN.storageBytesPerSeat / 1024 ** 3)} GB of
            storage per member, pooled across the workspace
          </li>
          <li>AI chapters, suggested titles and filler word removal</li>
        </ul>

        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onCheckout}
            className="flex h-11 w-full shrink-0 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white transition-colors hover:bg-accent/90 motion-reduce:transition-none"
          >
            Upgrade for ${total}/month
          </a>
        ) : (
          <span className="flex h-11 w-full items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-fg-muted">
            Checkout not configured
          </span>
        )}
      </div>
    </div>
  );
}

// The dialog itself, loaded on first open: it carries the marketing copy and
// the managed card, which no dashboard page needs until then.
export function UpgradeModalBody({
  email,
  userId,
  seat,
  isOpen,
  onOpenChange,
}: Props) {
  // PostHog distinct_id isn't available server-side at render, so append it
  // at click time.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("checkout_opened", { plan: "seats" });
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
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Backdrop>
        <Modal.Container>
          {/* The dialog is the landing's managed card: blue plan panel on
              the left, what's included on the right. */}
          <Modal.Dialog
            data-split="upgrade-modal"
            className="max-w-3xl rounded-2xl bg-panel p-2"
          >
            {/* This dialog has no footer action, so the X is the only
                in-dialog way out. Positions itself top-right. */}
            <Modal.CloseTrigger />
            <Modal.Body className="grid gap-2 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
              <SeatPlanPanel
                seat={seat}
                email={email}
                userId={userId}
                onCheckout={handleCheckoutClick}
              />
              <PlanIncludes copy={includes} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
