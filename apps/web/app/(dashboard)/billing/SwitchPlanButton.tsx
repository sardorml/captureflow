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
  const target = getSeatPlan(to);
  const before = seatPriceUsd(seats, cycle, from);
  const after = seatPriceUsd(seats, cycle, to);
  const seatWord = seats === 1 ? "seat" : "seats";

  const confirm = () =>
    startTransition(async () => {
      setError(null);
      const result = await switchPlanAction(to);
      if (result.ok) setOpen(false);
      else setError(result.error ?? "Couldn’t change the plan");
    });

  return (
    <>
      <Button className="shrink-0" onClick={() => setOpen(true)}>
        <Sparkles size={16} />
        Switch to {target.name}
      </Button>
      <AlertDialog open={isOpen} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {target.name}?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription asChild>
            <div className="flex flex-col gap-2 text-sm text-fg">
              <p>
                Your {seats} {seatWord} go from ${before} to ${after} a month
                {cycle === "annual" ? ", billed yearly" : ""}. {target.name}{" "}
                records at every quality up to 60 fps and adds AI editing.
              </p>
              <p className="text-fg-muted">
                It starts now. The difference for the rest of this billing
                period is added to your next invoice.
              </p>
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
              Cancel
            </Button>
            <Button size="sm" disabled={pending} onClick={confirm}>
              Switch to {target.name}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
