"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  type DevSubscriptionState,
  getDevSubscriptionAction,
  setDevSubscriptionAction,
} from "@/app/(dashboard)/dev-subscription-action";
import {
  OVERRIDE_STATUSES,
  type OverrideStatus,
} from "@/lib/dev/subscription-override";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const PLANS = [
  { id: "none", label: "No override" },
  { id: "free", label: "Free" },
  { id: "light", label: "Light" },
  { id: "pro", label: "Pro" },
] as const;

const STATUS_LABEL: Record<OverrideStatus, string> = {
  active: "Active",
  on_trial: "On trial",
  past_due: "Past due",
  cancelled: "Cancelled, until period end",
  paused: "Paused",
  unpaid: "Unpaid",
};

export function DevSubscription({ isOpen }: { isOpen: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<DevSubscriptionState | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!isOpen) return;
    let live = true;
    void getDevSubscriptionAction().then((next) => {
      if (live) setState(next);
    });
    return () => {
      live = false;
    };
  }, [isOpen]);

  const override = state?.ok ? state.override : null;
  const plan = override?.plan ?? "none";
  const status = override?.status ?? "active";

  const apply = (nextPlan: string, nextStatus: string) => {
    const form = new FormData();
    form.set("plan", nextPlan);
    form.set("status", nextStatus);
    startTransition(async () => {
      setState(await setDevSubscriptionAction(form));
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="flex items-center gap-2 text-sm font-medium text-fg">
        Subscription override
        {pending && <Spinner className="size-3.5" />}
      </span>
      {state === null ? (
        <span className="text-xs text-fg-muted">Loading…</span>
      ) : !state.ok ? (
        <span className="text-xs text-fg-muted">{state.error}</span>
      ) : (
        <>
          <span className="text-xs text-fg-muted">
            Pretends {state.workspaceName} is on this plan and status
            everywhere, the extension included. No override puts the real
            billing back.
          </span>
          <div className="flex gap-2">
            <Select
              value={plan}
              disabled={pending}
              onValueChange={(next) =>
                apply(next === "none" ? "" : next, status)
              }
            >
              <SelectTrigger aria-label="Plan" className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLANS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              disabled={pending || plan === "none" || plan === "free"}
              onValueChange={(next) => apply(plan, next)}
            >
              <SelectTrigger aria-label="Status" className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OVERRIDE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_LABEL[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
  );
}
