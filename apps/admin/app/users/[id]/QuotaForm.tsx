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
      <TextRow
        name="storageBytesOverride"
        label="Storage override (bytes)"
        hint="The only quota there is — blank means the account's tier default."
        inputMode="numeric"
        defaultValue={String(quota.storageBytesOverride ?? "")}
      />
      <TextRow
        name="note"
        label="Note"
        placeholder="Why this override exists"
        defaultValue={quota.note ?? ""}
      />
    </ActionForm>
  );
}
