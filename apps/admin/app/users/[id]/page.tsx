import { notFound } from "next/navigation";
import { can, getAdminUser, getUserQuota } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  PageHeading,
  SectionHeading,
  Stat,
  formatBytes,
  formatDate,
} from "../../_ui";
import { QuotaForm } from "./QuotaForm";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const operator = await requirePermission("users.read");
  const { id } = await params;
  const env = await getAdminEnv();
  if (!env?.DB) notFound();

  const [user, quota] = await Promise.all([
    getAdminUser(env.DB, id),
    getUserQuota(env.DB, id),
  ]);
  if (!user) notFound();
  const canWrite = can(operator.role, "users.write");

  return (
    <div className="flex flex-col gap-8">
      <PageHeading title={user.name || user.email}>
        {user.email} · joined {formatDate(user.createdAt)}
      </PageHeading>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <Stat label="Recordings" value={String(user.recordingCount)} />
        <Stat label="Screenshots" value={String(user.screenshotCount)} />
        <Stat label="Stored" value={formatBytes(user.storageBytes)} />
      </div>

      <section className="border-line bg-panel flex flex-col gap-4 rounded-xl border p-5">
        <SectionHeading title="Quota overrides">
          {canWrite
            ? "Leave a field empty to fall back to the plan default."
            : "Read-only: your role cannot change quotas."}
          {quota.updatedAt
            ? ` Last changed ${formatDate(quota.updatedAt)}.`
            : ""}
        </SectionHeading>
        {canWrite ? (
          <QuotaForm userId={user.id} quota={quota} />
        ) : (
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-fg-muted text-xs">Storage override</dt>
              <dd className="tabular-nums">
                {quota.storageBytesOverride ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-fg-muted text-xs">Note</dt>
              <dd>{quota.note ?? "—"}</dd>
            </div>
          </dl>
        )}
      </section>
    </div>
  );
}
