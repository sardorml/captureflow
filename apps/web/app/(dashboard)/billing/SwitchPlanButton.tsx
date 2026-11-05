"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { getSeatPlan, seatPriceUsd, type SeatPlanId } from "@captureflow/quota";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useAppLocale,
  useAppMessages,
  useMoney,
} from "@/components/app-i18n-provider";
import { fmt, plural } from "@/lib/i18n/format";
import { switchPlanAction } from "./actions";

export function SwitchPlanButton({
  from,
  to,
  seats,
  cycle,
  defaultOpen = false,
}: {
  from: SeatPlanId;
  to: SeatPlanId;
  seats: number;
  cycle: "monthly" | "annual";
  defaultOpen?: boolean;
}) {
  const [isOpen, setOpen] = useState(defaultOpen);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const m = useAppMessages();
  const { lang } = useAppLocale();
  const money = useMoney();
  const t = m.billing.switchPlan;
  const target = getSeatPlan(to);
  const before = seatPriceUsd(seats, cycle, from);
  const after = seatPriceUsd(seats, cycle, to);
  const switchTo = fmt(t.switchTo, { plan: target.name });

  const confirm = () =>
    startTransition(async () => {
      setError(null);
      const result = await switchPlanAction(to);
      if (result.ok) setOpen(false);
      else setError(result.error ?? t.errors.failed);
    });

  return (
    <>
      <Button className="shrink-0" onClick={() => setOpen(true)}>
        <Sparkles size={16} />
        {switchTo}
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {fmt(t.title, { plan: target.name })}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-fg">
              <p>
                {fmt(
                  plural(
                    cycle === "annual" ? t.priceYearly : t.priceMonthly,
                    seats,
                    lang,
                  ),
                  { before: money.format(before), after: money.format(after) },
                )}{" "}
                {fmt(t.benefits, { plan: target.name })}
              </p>
              <p className="text-fg-muted">{t.timing}</p>
              {error && <p className="text-destructive">{error}</p>}
            </div>
          </AlertDialogDescription>
          <AlertDialogFooter>
            <Button
              variant="secondary"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              {m.common.cancel}
            </Button>
            <Button size="sm" disabled={pending} onClick={confirm}>
              {switchTo}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
