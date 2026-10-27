"use client";

import { useOptimistic, useState, useTransition } from "react";
import { Check, Sparkle } from "lucide-react";
import { Avatar, Modal } from "@heroui/react";
import {
  DEFAULT_SEAT_PLAN_ID,
  SEAT_PLANS,
  getSeatPlan,
  isSeatRole,
  seatAnnualSavingPercent,
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
  const [planId, setPlanId] = useState<SeatPlanId>(DEFAULT_SEAT_PLAN_ID);
  const plan = getSeatPlan(planId);
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
  const perSeat =
    cycle === "annual" ? plan.priceAnnualUsdPerMonth : plan.priceMonthlyUsd;
  const total = seatPriceUsd(seats, cycle, planId);
  const planCopy = PLAN_COPY[planId];
  const checkoutBase = seat.checkoutUrls[planId][cycle];
  const href = checkoutBase
    ? seatCheckoutUrl({
        base: checkoutBase,
        email,
        userId,
        workspaceId: seat.workspaceId,
        plan: planId,
        seats,
      })
    : null;

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
          <Modal.Dialog
            data-split="upgrade-modal"
            className="max-w-4xl rounded-3xl bg-panel p-0"
          >
            <Modal.CloseTrigger />
            <Modal.Body className="grid gap-0 p-0 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="flex min-w-0 flex-col p-6 sm:p-8 md:order-2">
                <Modal.Heading className="text-2xl font-bold tracking-[-0.02em] text-fg">
                  Upgrade {seat.workspaceName}
                </Modal.Heading>
                <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line">
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
              </div>

              <div className="p-2 md:order-1 md:pr-0">
                <div
                  className={cn("h-full rounded-[28px] p-0.5", GRADIENT_BORDER)}
                >
                  <div className="flex h-full flex-col rounded-[26px] bg-[color-mix(in_oklab,var(--accent)_8%,var(--cf-panel))] p-6 text-fg">
                    <div
                      role="radiogroup"
                      aria-label="Plan"
                      className="grid grid-cols-2 gap-2"
                    >
                      {SEAT_PLANS.map((p) => {
                        const isOn = p.id === planId;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            role="radio"
                            aria-checked={isOn}
                            onClick={() => setPlanId(p.id)}
                            className={cn(
                              "flex cursor-pointer flex-col items-start rounded-xl border px-3 py-2.5 text-left transition-colors motion-reduce:transition-none",
                              isOn
                                ? "border-accent bg-panel shadow-sm"
                                : "border-line bg-transparent hover:bg-panel/60",
                            )}
                          >
                            <span className="flex items-center gap-1 text-base font-bold tracking-[-0.01em]">
                              {p.name}
                              {p.id === DEFAULT_SEAT_PLAN_ID && (
                                <Sparkle
                                  size={12}
                                  className="shrink-0 fill-current"
                                />
                              )}
                            </span>
                            <span className="text-xs text-fg-muted">
                              ${p.priceMonthlyUsd} per member
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 min-h-12 text-[15px] leading-relaxed text-fg-muted">
                      {planCopy.description}
                    </p>

                    <div
                      role="radiogroup"
                      aria-label="Billing cycle"
                      className="mt-4 grid grid-cols-2 gap-1 rounded-lg bg-tint p-1"
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
                              "cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition-colors motion-reduce:transition-none",
                              isOn
                                ? "bg-panel text-fg shadow-sm"
                                : "text-fg-muted hover:text-fg",
                            )}
                          >
                            {c.label}
                            {c.key === "annual" ? (
                              <span className="ms-1.5 text-xs opacity-80">
                                save {seatAnnualSavingPercent(plan)}%
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-6 text-4xl font-bold tracking-[-0.03em]">
                      <span
                        key={`${planId}-${cycle}-${total}`}
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
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleCheckoutClick}
                        className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-accent px-6 text-sm font-semibold text-white transition-colors hover:bg-accent/90 motion-reduce:transition-none"
                      >
                        Upgrade to {plan.name}
                      </a>
                    ) : (
                      <span className="mt-6 inline-flex h-11 w-fit items-center justify-center rounded-full bg-accent/10 px-6 text-sm font-medium text-fg-muted">
                        Checkout not configured
                      </span>
                    )}

                    <p className="mt-8 text-sm font-semibold">
                      {planCopy.featuresHeading}
                    </p>
                    <ul className="mt-3 flex list-none flex-col gap-2.5">
                      {planCopy.features.map((label) => (
                        <li
                          key={label}
                          className="flex items-start gap-2.5 text-[15px]"
                        >
                          <Check
                            size={16}
                            className="mt-1 shrink-0 text-fg-muted"
                          />
                          <span>{label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
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
    <li className="flex items-center gap-3 px-4 py-3">
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
          className="grid shrink-0 grid-cols-2 gap-0.5 rounded-lg bg-tint p-0.5 text-xs font-medium"
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
                  "cursor-pointer rounded-md px-2.5 py-1 transition-colors motion-reduce:transition-none",
                  isOn
                    ? "bg-panel text-fg shadow-sm"
                    : "text-fg-muted hover:text-fg",
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
