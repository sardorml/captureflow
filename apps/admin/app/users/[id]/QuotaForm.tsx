"use client";

import type { AdminQuotaRow } from "@captureflow/admin";
import { saveQuotaAction } from "../../actions";
import { ActionForm, TextRow } from "../../_form";

export function QuotaForm({
  userId,
  quota,
}: {
  userId: string;
  quota: AdminQuotaRow;
}) {
  return (
    <ActionForm
      action={saveQuotaAction}
      submit="Save overrides"
      busy="Saving…"
      className="flex flex-col gap-4"
    >
      <input type="hidden" name="userId" value={userId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextRow
          name="storageBytesOverride"
          label="Storage override (bytes)"
          inputMode="numeric"
          defaultValue={String(quota.storageBytesOverride ?? "")}
        />
        <TextRow
          name="activeRecordingsOverride"
          label="Active recordings override"
          inputMode="numeric"
          defaultValue={String(quota.activeRecordingsOverride ?? "")}
        />
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
