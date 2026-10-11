"use client";

import { useState, useTransition } from "react";
import { Ellipsis } from "lucide-react";
import { Button, Dropdown, Label, Spinner } from "@heroui/react";
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

  const run = (id: string) => {
    const item = actions.find((a) => a.id === id);
    if (!item) return;
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
      {error && <span className="text-danger text-xs">{error}</span>}
      <Dropdown>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          aria-label={label}
          isDisabled={pending}
        >
          {pending ? <Spinner size="sm" /> : <Ellipsis size={16} />}
        </Button>
        <Dropdown.Popover placement="bottom end" className="min-w-44">
          <Dropdown.Menu
            aria-label={label}
            onAction={(key) => run(String(key))}
          >
            {actions.map((a) => (
              <Dropdown.Item
                key={a.id}
                id={a.id}
                textValue={a.label}
                variant={a.danger ? "danger" : "default"}
              >
                <Label>{a.label}</Label>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
