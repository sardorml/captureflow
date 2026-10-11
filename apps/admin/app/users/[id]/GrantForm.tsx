"use client";

import type { GrantedPlan } from "@captureflow/admin";
import { grantPlanAction } from "../../actions";
import { ActionForm, TextRow } from "../../_form";
import { OptionSelect } from "../../_select";

// The stored expiry is the first instant after the last included day.
function lastDay(expiresAt: number | null): string {
  return expiresAt ? new Date(expiresAt - 1).toISOString().slice(0, 10) : "";
}

export function GrantForm({
  userId,
  grant,
  plans,
}: {
  userId: string;
  grant: GrantedPlan | null;
  plans: readonly { variantId: string; label: string }[];
}) {
  const options = [
    { id: "none", label: "No granted plan" },
    ...plans.map((p) => ({ id: p.variantId, label: `Pro · ${p.label}` })),
  ];
  return (
    <ActionForm
      action={grantPlanAction}
      submit="Save plan"
      busy="Saving…"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex flex-wrap items-start gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">Granted plan</span>
          <OptionSelect
            name="plan"
            label="Granted plan"
            defaultValue={grant?.variantId ?? "none"}
            options={options}
            className="min-w-[200px]"
          />
        </div>
        <TextRow
          name="until"
          label="Last day (UTC)"
          hint="YYYY-MM-DD. Leave empty for no end date."
          placeholder="No end date"
          defaultValue={lastDay(grant?.expiresAt ?? null)}
        />
      </div>
    </ActionForm>
  );
}
