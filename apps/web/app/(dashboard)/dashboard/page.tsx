import type { ReactNode } from "react";
import Link from "next/link";
import { BookOpen, Database, ExternalLink, Users } from "lucide-react";
import { ProgressBar } from "@heroui/react";
import {
  listMembers,
  totalStorageForUser,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import { SplitLoaded } from "@/components/dev/split-loaded";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { DAY_MS, MAX_METRIC_RANGE, dayOf } from "@/lib/dashboard-metrics";
import { loadDashboardActivity } from "@/lib/dashboard-metrics-db";
import { formatBytes } from "@/lib/format";
import { requireSession } from "@/lib/session-guard";
import { CHROME_WEBSTORE_URL, DOCS_URL, DOWNLOAD_URL } from "@/lib/site";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { MetricCards } from "./MetricCards";
import { StartCard } from "./StartCard";

export const dynamic = "force-dynamic";

const METER_COLOR: Record<StorageTone, "success" | "warning" | "danger"> = {
  ok: "success",
  near: "warning",
  full: "danger",
};

export default async function DashboardPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const now = Date.now();
  const since = (dayOf(now) - (MAX_METRIC_RANGE - 1)) * DAY_MS;
  const [activity, usedBytes, limit, members] = await Promise.all([
    loadDashboardActivity(current.workspace.id, session.user.id, since),
    env?.DB ? totalStorageForUser(env.DB, session.user.id) : 0,
    getEffectiveStorageLimit(session.user.id),
    env?.DB ? listMembers(env.DB, current.workspace.id) : [],
  ]);
  const limitBytes = limit >= UNLIMITED_STORAGE_BYTES ? null : limit;
  const fill = storageFill(usedBytes, limitBytes);
  const isOwner = current.role === "owner";

  return (
    <div className="flex flex-col gap-6">
      <SplitLoaded name="page" />
      <StartCard storeUrl={CHROME_WEBSTORE_URL} downloadUrl={DOWNLOAD_URL} />
      <MetricCards activity={activity} now={now} />
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard
          href="/storage"
          icon={<Database size={20} />}
          footer="Manage storage"
        >
          <p className="text-sm text-fg-muted">Storage</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-fg-strong">
            {formatBytes(usedBytes)}
          </p>
          <p className="mt-1 text-sm text-fg-muted">
            {limitBytes === null ? "No limit" : `of ${formatBytes(limitBytes)}`}
          </p>
          {fill && (
            <ProgressBar
              value={Math.round(fill.ratio * 100)}
              color={METER_COLOR[fill.tone]}
              aria-label="Storage used"
              className="mt-3"
            >
              <ProgressBar.Track className="h-1.5 rounded-full bg-tint-strong">
                <ProgressBar.Fill className="rounded-full" />
              </ProgressBar.Track>
            </ProgressBar>
          )}
        </ActionCard>
        <ActionCard
          href="/members"
          icon={<Users size={20} />}
          footer={isOwner ? "Invite teammates" : "See who is here"}
        >
          <p className="text-sm text-fg-muted">Members</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums text-fg-strong">
            {members.length}
          </p>
          <p className="mt-1 truncate text-sm text-fg-muted">
            {current.workspace.name}
          </p>
        </ActionCard>
        <ActionCard
          href={DOCS_URL}
          external
          icon={<BookOpen size={20} />}
          footer="Guides and keyboard shortcuts"
        >
          <p className="text-xl font-semibold text-fg-strong">Documentation</p>
        </ActionCard>
      </div>
    </div>
  );
}

function ActionCard({
  href,
  external = false,
  icon,
  footer,
  children,
}: {
  href: string;
  external?: boolean;
  icon: ReactNode;
  footer: string;
  children: ReactNode;
}) {
  const className =
    "group flex min-h-56 flex-col rounded-2xl bg-panel p-5 ring-1 ring-line-strong transition-colors hover:bg-panel-2";
  const body = (
    <>
      <span className="flex size-12 items-center justify-center rounded-full bg-tint text-fg">
        {icon}
      </span>
      <div className="mt-auto pt-6">{children}</div>
      <p className="mt-4 flex items-center gap-1.5 text-sm text-fg-muted group-hover:text-fg">
        {footer}
        {external && <ExternalLink size={14} />}
      </p>
    </>
  );
  return external ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {body}
    </a>
  ) : (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
