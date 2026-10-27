"use client";

import { useState, useTransition } from "react";
import { Hand } from "lucide-react";
import { Button, Tooltip } from "@heroui/react";
import { requestPaidSeatAction } from "./members/actions";

// A viewer asks the workspace owner for a seat; the owner decides.
export function RequestSeatButton({ requested }: { requested: boolean }) {
  const [sent, setSent] = useState(requested);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const request = () =>
    startTransition(async () => {
      const result = await requestPaidSeatAction();
      if (result.ok) setSent(true);
      else setError(result.error ?? "Couldn’t send the request");
    });

  return (
    <Tooltip>
      <Tooltip.Trigger className="inline-flex">
        <Button
          variant="secondary"
          isDisabled={sent || pending}
          onPress={request}
        >
          <Hand size={16} />
          {sent ? "Seat requested" : "Request to record"}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        {error ??
          (sent
            ? "The owner has been asked. You’ll be able to record once they approve."
            : "You’re a viewer here. Ask the owner for a paid seat so you can record.")}
      </Tooltip.Content>
    </Tooltip>
  );
}
