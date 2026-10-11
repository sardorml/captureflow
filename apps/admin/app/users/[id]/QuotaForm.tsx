"use client";

import type { AdminQuotaRow } from "@captureflow/admin";
import { saveQuotaAction } from "../../actions";
import { ActionForm, TextRow } from "../../_form";
import { OptionSelect } from "../../_select";

const UNITS = [
  { id: "MB", label: "MB" },
  { id: "GB", label: "GB" },
  { id: "TB", label: "TB" },
] as const;

const UNIT_BYTES = [
  ["TB", 1024 ** 4],
  ["GB", 1024 ** 3],
  ["MB", 1024 ** 2],
] as const;

// The largest unit whose short decimal saves back to exactly the same bytes,
// so opening and re-saving the form never nudges the override.
function initialAmount(bytes: number | null): { amount: string; unit: string } {
  if (bytes === null) return { amount: "", unit: "GB" };
  for (const [unit, size] of UNIT_BYTES) {
    const amount = +(bytes / size).toFixed(3);
    if (amount >= 1 && Math.round(amount * size) === bytes) {
      return { amount: String(amount), unit };
    }
  }
  return { amount: String(+(bytes / 1024 ** 2).toFixed(3)), unit: "MB" };
}

export function QuotaForm({
  userId,
  quota,
}: {
  userId: string;
  quota: AdminQuotaRow;
}) {
  const initial = initialAmount(quota.storageBytesOverride);
  return (
    <ActionForm
      action={saveQuotaAction}
      submit="Save storage"
      busy="Saving…"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="flex items-end gap-2">
        <TextRow
          name="storageAmount"
          label="Storage override"
          hint="Replaces the plan's storage outright. Leave empty to use the plan."
          inputMode="decimal"
          placeholder="e.g. 250"
          defaultValue={initial.amount}
        />
        <div className="pb-6">
          <OptionSelect
            name="storageUnit"
            label="Unit"
            defaultValue={initial.unit}
            options={UNITS}
            className="min-w-[84px]"
          />
        </div>
      </div>
      <TextRow
        name="note"
        label="Note"
        placeholder="Why this override exists"
        defaultValue={quota.note ?? ""}
      />
    </ActionForm>
  );
}
