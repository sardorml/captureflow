"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Sparkle } from "lucide-react";
import { Avatar, Modal } from "@heroui/react";
import {
  DEFAULT_SEAT_PLAN_ID,
  SEAT_PLANS,
  getSeatPlan,
  isSeatRole,
  SEAT_ANNUAL_SAVING_PERCENT,
  seatPriceUsd,
  type AssignableRole,
  type SeatPlanId,
} from "@captureflow/quota";
import { GRADIENT_BORDER } from "@/components/marketing/plan-cards";
import { MESSAGES } from "@/lib/marketing/messages";
import { getPosthogDistinctId, track } from "@/lib/marketing/track";
import {
  seatCheckoutUrl,
  type SeatCycle,
  type SeatOffer,
  type SeatPerson,
} from "@/lib/billing/seat-checkout";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ROLE_LABEL } from "@/lib/workspace/labels";
import { changeMemberRoleAction } from "./members/actions";

const PLAN_COPY = MESSAGES.pricing.plans;

const CYCLES: { key: SeatCycle; label: string }[] = [
  { key: "monthly", label: "Monthly" },
  { key: "annual", label: "Yearly" },
];

const SEAT_CHOICES: { role: AssignableRole; label: string }[] = [
  { role: "member", label: "Seat" },
  { role: "viewer", label: "Viewer" },
];

type Props = {
  email: string;
  userId: string;
  seat: SeatOffer;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

/*
 * The buyer picks who gets a seat before paying: every member is billed,
 * viewers never are. Demotions go through the same role action as the
 * members page, shown optimistically so the total follows the click.
 */
export function UpgradeModalBody({
  email,
  userId,
  seat,
  isOpen,
  onOpenChange,
}: Props) {
  const [cycle, setCycle] = useState<SeatCycle>("monthly");
  const [people, applyRole] = useOptimistic(
    seat.people,
    (state, next: { userId: string; role: AssignableRole }) =>
      state.map((p) =>
        p.userId === next.userId ? { ...p, role: next.role } : p,
      ),
  );
  const [, startTransition] = useTransition();

  const canManage = people.some(
    (p) => p.userId === userId && p.role === "owner",
  );
  const seats = Math.max(1, people.filter((p) => isSeatRole(p.role)).length);
  const viewers = people.length - seats;
  const checkoutHref = (planId: SeatPlanId) => {
    const base = seat.checkoutUrls[planId][cycle];
    return base
      ? seatCheckoutUrl({
          base,
          email,
          userId,
          workspaceId: seat.workspaceId,
          plan: planId,
          seats,
        })
      : null;
  };

  const setRole = (personId: string, role: AssignableRole) =>
    startTransition(async () => {
      applyRole({ userId: personId, role });
      const fd = new FormData();
      fd.set("userId", personId);
      fd.set("role", role);
      await changeMemberRoleAction(fd);
    });

  // PostHog distinct_id isn't available server-side at render, so append it
  // at click time.
  const handleCheckoutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    track("checkout_opened", { plan: e.currentTarget.dataset.plan ?? "seats" });
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
          <Modal.Dialog
            data-split="upgrade-modal"
            className="max-w-3xl rounded-3xl bg-panel p-0"
          >
            <Modal.CloseTrigger />
            <Modal.Body className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pe-8">
                <Modal.Heading className="text-2xl font-bold tracking-[-0.02em] text-fg">
                  Upgrade {seat.workspaceName}
                </Modal.Heading>
                <div
                  role="radiogroup"
                  aria-label="Billing cycle"
                  className="grid grid-cols-2 gap-1 rounded-full bg-tint p-1"
                >
                  {CYCLES.map((c) => {
                    const isOn = c.key === cycle;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        role="radio"
                        aria-checked={isOn}
                        onClick={() => setCycle(c.key)}
                        className={cn(
                          "cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none",
                          isOn
                            ? "bg-panel text-fg shadow-sm"
                            : "text-fg-muted hover:text-fg",
                        )}
                      >
                        {c.label}
                        {c.key === "annual" ? (
                          <span className="ms-1.5 text-xs text-accent">
                            save up to {SEAT_ANNUAL_SAVING_PERCENT}%
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {SEAT_PLANS.map((p) => (
                  <PlanOption
                    key={p.id}
                    planId={p.id}
                    cycle={cycle}
                    seats={seats}
                    viewers={viewers}
                    href={checkoutHref(p.id)}
                    onCheckout={handleCheckoutClick}
                  />
                ))}
              </div>

              <p className="mt-5 text-sm font-semibold text-fg">
                Who gets a seat
              </p>
              <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {people.map((p) => (
                  <PersonRow
                    key={p.userId}
                    person={p}
                    isSelf={p.userId === userId}
                    editable={canManage && p.role !== "owner"}
                    onRole={(role) => setRole(p.userId, role)}
                  />
                ))}
              </ul>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

function PlanOption({
  planId,
  cycle,
  seats,
  viewers,
  href,
  onCheckout,
}: {
  planId: SeatPlanId;
  cycle: SeatCycle;
  seats: number;
  viewers: number;
  href: string | null;
  onCheckout: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  const plan = getSeatPlan(planId);
  const copy = PLAN_COPY[planId];
  const highlighted = planId === DEFAULT_SEAT_PLAN_ID;
  const perSeat =
    cycle === "annual" ? plan.priceAnnualUsdPerMonth : plan.priceMonthlyUsd;
  const total = seatPriceUsd(seats, cycle, planId);

  const card = (
    <div
      className={cn(
        "flex h-full flex-col p-5 text-fg",
        highlighted
          ? "rounded-[22px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))]"
          : "rounded-3xl border border-line bg-panel",
      )}
    >
      <h3 className="flex items-start gap-1 text-2xl font-bold tracking-[-0.03em]">
        {plan.name}
        {highlighted && <Sparkle size={13} className="shrink-0 fill-current" />}
      </h3>
      <p className="mt-1 min-h-10 text-sm leading-snug text-fg-muted">
        {copy.description}
      </p>

      <p className="mt-3 text-3xl font-bold tracking-[-0.03em]">
        <span
          key={`${cycle}-${total}`}
          className="animate-storage-pop inline-block"
        >
          ${total}
        </span>
        <span className="ms-2 align-baseline text-sm font-normal text-fg-muted">
          per month
        </span>
      </p>
      <p className="mt-1 text-sm text-fg-muted">
        {seats} {seats === 1 ? "seat" : "seats"} × ${perSeat}
        {viewers > 0
          ? `, ${viewers} ${viewers === 1 ? "viewer" : "viewers"} free`
          : ""}
        {cycle === "annual" ? ", billed yearly" : ""}
      </p>

      {href ? (
        <a
          href={href}
          data-plan={planId}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onCheckout}
          className={cn(
            "mt-4 inline-flex h-10 w-fit items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors motion-reduce:transition-none",
            highlighted
              ? "bg-accent text-white hover:bg-accent/90"
              : "bg-accent/10 text-fg hover:bg-accent/20",
          )}
        >
          Upgrade to {plan.name}
        </a>
      ) : (
        <span className="mt-4 inline-flex h-10 w-fit items-center justify-center rounded-full bg-accent/10 px-6 text-sm font-medium text-fg-muted">
          Checkout not configured
        </span>
      )}

      <p className="mt-5 text-sm font-semibold">{copy.featuresHeading}</p>
      <ul className="mt-2 flex list-none flex-col gap-1.5">
        {copy.features.map((label) => (
          <li key={label} className="flex items-start gap-2.5 text-sm">
            <Check size={15} className="mt-0.5 shrink-0 text-fg-muted" />
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  if (!highlighted) return card;
  return <div className={cn("rounded-3xl p-0.5", GRADIENT_BORDER)}>{card}</div>;
}

function PersonRow({
  person,
  isSelf,
  editable,
  onRole,
}: {
  person: SeatPerson;
  isSelf: boolean;
  editable: boolean;
  onRole: (role: AssignableRole) => void;
}) {
  const display = person.name || person.email.split("@")[0];
  const seated = isSeatRole(person.role);
  return (
    <li className="flex items-center gap-3 px-4 py-2">
      <Avatar className="h-8 w-8 shrink-0">
        {person.image && <Avatar.Image src={person.image} alt={display} />}
        <Avatar.Fallback className="text-xs">
          {initials(person.name || person.email)}
        </Avatar.Fallback>
      </Avatar>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-fg">
          {display}
          {isSelf && <span className="text-fg-muted"> (you)</span>}
        </span>
        <span className="truncate text-xs text-fg-muted">{person.email}</span>
      </span>
      {editable ? (
        <div
          role="radiogroup"
          aria-label={`Role for ${display}`}
          className="flex shrink-0 items-center gap-1.5"
        >
          {SEAT_CHOICES.map((c) => {
            const isOn = c.role === person.role;
            return (
              <button
                key={c.role}
                type="button"
                role="radio"
                aria-checked={isOn}
                onClick={() => !isOn && onRole(c.role)}
                className={cn(
                  "h-8 cursor-pointer rounded-full px-3.5 text-sm font-semibold transition-colors motion-reduce:transition-none",
                  isOn
                    ? "bg-accent text-white shadow-sm"
                    : "border border-line bg-panel text-fg hover:border-accent hover:text-accent",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      ) : (
        <span className="shrink-0 text-xs font-medium text-fg-muted">
          {ROLE_LABEL[person.role]}
          {seated ? " · seat" : " · free"}
        </span>
      )}
    </li>
  );
}
