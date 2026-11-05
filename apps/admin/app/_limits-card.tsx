import { FREE_TIER, type LimitOverride } from "@captureflow/admin";
import type { FormState } from "./actions";
import { LimitsForm } from "./_limits";
import { FormCard } from "./_ui";

const DEFAULTS = {
  recordings: FREE_TIER.recordingsPerPerson,
  minutes: FREE_TIER.maxRecordingMs / 60_000,
};

function describe(override: LimitOverride | null): string {
  const recordings = override?.recordings ?? DEFAULTS.recordings;
  const minutes =
    override?.maxRecordingMs == null
      ? DEFAULTS.minutes
      : override.maxRecordingMs / 60_000;
  return `${recordings} recordings of up to ${minutes} minutes each`;
}

export function LimitsCard({
  appliesTo,
  action,
  id,
  override,
  canWrite,
}: {
  appliesTo: string;
  action: (prev: FormState, data: FormData) => Promise<FormState>;
  id: string;
  override: LimitOverride | null;
  canWrite: boolean;
}) {
  return (
    <FormCard
      title="Free plan limits"
      description={`Raise what ${appliesTo}. Now: ${describe(override)}. The default is ${describe(null)}; leave a field blank to keep it.`}
    >
      {canWrite ? (
        <LimitsForm
          action={action}
          id={id}
          override={override}
          defaults={DEFAULTS}
        />
      ) : (
        <p className="text-fg-muted text-sm">
          Read-only: your role cannot change limits.
        </p>
      )}
    </FormCard>
  );
}
