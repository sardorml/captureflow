import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DEFAULT_SEAT_PLAN_ID,
  getSeatPlan,
  type WorkspaceEntitlement,
} from "@captureflow/quota";

export function SidebarPlanCard({
  entitlement,
  seats,
  recordingCount,
  renewsAt,
  isEnding,
  canManageBilling,
}: {
  entitlement: WorkspaceEntitlement;
  seats: number;
  recordingCount: number;
  renewsAt: number | null;
  isEnding: boolean;
  canManageBilling: boolean;
}) {
  const planName =
    entitlement.tier === "team"
      ? getSeatPlan(entitlement.plan ?? DEFAULT_SEAT_PLAN_ID).name
      : "Free";
  return (
    <div className="rounded-2xl bg-panel p-4 ring-1 ring-line">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-fg-strong">{planName} plan</p>
        <p className="text-xs text-fg-muted">
          {seats} {seats === 1 ? "seat" : "seats"}
        </p>
      </div>
      <p className="mt-2 text-xs leading-5 text-fg-muted">
        {recordingCount} {recordingCount === 1 ? "recording" : "recordings"}
        {canManageBilling && renewsAt !== null && (
          <>
            <br />
            {isEnding ? "Ends" : "Renews"}{" "}
            {new Date(renewsAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </>
        )}
      </p>
      {canManageBilling && (
        <>
          <hr className="my-3 border-line" />
          <Link
            href="/billing"
            className="flex items-center justify-between text-sm font-medium text-fg hover:text-accent"
          >
            Manage billing
            <ArrowRight size={16} />
          </Link>
        </>
      )}
    </div>
  );
}
