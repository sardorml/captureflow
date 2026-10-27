"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { AlertDialog, Button } from "@heroui/react";
import { getSeatPlan, seatPriceUsd, type SeatPlanId } from "@captureflow/quota";
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
      <Button
        variant="primary"
        className="shrink-0"
        onPress={() => setOpen(true)}
      >
        <Sparkles size={16} />
        Switch to {target.name}
      </Button>
      <AlertDialog isOpen={isOpen} onOpenChange={setOpen}>
        <AlertDialog.Backdrop>
          <AlertDialog.Container size="sm">
            <AlertDialog.Dialog>
              <AlertDialog.Header>
                <AlertDialog.Heading>
                  Switch to {target.name}?
                </AlertDialog.Heading>
              </AlertDialog.Header>
              <AlertDialog.Body className="flex flex-col gap-2 text-sm text-fg">
                <p>
                  Your {seats} {seatWord} go from ${before} to ${after} a month
                  {cycle === "annual" ? ", billed yearly" : ""}. {target.name}{" "}
                  records at every quality up to 60 fps and adds AI editing.
                </p>
                <p className="text-fg-muted">
                  It starts now. The difference for the rest of this billing
                  period is added to your next invoice.
                </p>
                {error && <p className="text-danger">{error}</p>}
              </AlertDialog.Body>
              <AlertDialog.Footer className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  isDisabled={pending}
                  onPress={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button size="sm" isDisabled={pending} onPress={confirm}>
                  Switch to {target.name}
                </Button>
              </AlertDialog.Footer>
            </AlertDialog.Dialog>
          </AlertDialog.Container>
        </AlertDialog.Backdrop>
      </AlertDialog>
    </>
  );
}
