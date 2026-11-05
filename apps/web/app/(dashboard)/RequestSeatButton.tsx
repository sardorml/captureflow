"use client";

import { useState, useTransition } from "react";
import { Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppMessages } from "@/components/app-i18n-provider";
import { requestPaidSeatAction } from "./members/actions";

// A viewer asks the workspace owner for a seat; the owner decides.
export function RequestSeatButton({ requested }: { requested: boolean }) {
  const [sent, setSent] = useState(requested);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const t = useAppMessages().billing.requestSeat;

  const request = () =>
    startTransition(async () => {
      const result = await requestPaidSeatAction();
      if (result.ok) setSent(true);
      else setError(result.error ?? t.failed);
    });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex" tabIndex={0}>
          <Button
            variant="secondary"
            disabled={sent || pending}
            onClick={request}
          >
            <Hand size={16} />
            {sent ? t.requested : t.request}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {error ?? (sent ? t.requestedHint : t.hint)}
      </TooltipContent>
    </Tooltip>
  );
}
