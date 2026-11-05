"use client";

import type { LimitOverride } from "@captureflow/admin";
import type { FormState } from "./actions";
import { ActionForm, TextRow } from "./_form";

// Blank fields keep the defaults, which the placeholders show.
export function LimitsForm({
  action,
  id,
  override,
  defaults,
}: {
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  id: string;
  override: LimitOverride | null;
  defaults: { recordings: number; minutes: number };
}) {
  const minutes =
    override?.maxRecordingMs == null ? null : override.maxRecordingMs / 60_000;
  return (
    <ActionForm action={action} submit="Save limits" busy="Saving…">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-3 sm:grid-cols-2">
        <TextRow
          name="recordings"
          label="Recordings per person"
          inputMode="numeric"
          defaultValue={override?.recordings?.toString() ?? ""}
          placeholder={`${defaults.recordings} (default)`}
        />
        <TextRow
          name="minutes"
          label="Minutes per recording"
          inputMode="numeric"
          defaultValue={minutes?.toString() ?? ""}
          placeholder={`${defaults.minutes} (default)`}
        />
      </div>
    </ActionForm>
  );
}
