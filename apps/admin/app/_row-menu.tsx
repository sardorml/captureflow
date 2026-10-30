"use client";

import { useState, useTransition } from "react";
import { Ellipsis } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import type { FormState } from "./actions";
import { EMPTY } from "./_form";

export type RowAction = {
  id: string;
  label: string;
  danger?: boolean;
  confirm?: string;
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  fields: Record<string, string>;
};

// A row's mutations behind one "…" menu; a failure shows beside the trigger.
export function RowMenu({
  label,
  actions,
}: {
  label: string;
  actions: RowAction[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (item: RowAction) => {
    if (item.confirm && !window.confirm(item.confirm)) return;
    const data = new FormData();
    for (const [k, v] of Object.entries(item.fields)) data.set(k, v);
    setError(null);
    start(async () => {
      const result = await item.action(EMPTY, data);
      if (result.error) setError(result.error);
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {error && <span className="text-destructive text-xs">{error}</span>}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={label}
            disabled={pending}
          >
            {pending ? <Spinner /> : <Ellipsis size={16} />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          aria-label={label}
          className="min-w-44"
        >
          {actions.map((a) => (
            <DropdownMenuItem
              key={a.id}
              variant={a.danger ? "destructive" : "default"}
              onSelect={() => run(a)}
            >
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
