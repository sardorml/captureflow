import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { Button, Card, ProgressBar, Typography } from "@heroui/react";
import {
  isSelfHosted,
  listStorageItemsForUser,
  totalStorageForUser,
  UNLIMITED_STORAGE_BYTES,
} from "@captureflow/quota";
import { formatBytes } from "@/lib/format";
import { getAppWebEnv } from "@/lib/cf-env";
import { requireSession } from "@/lib/session-guard";
import { storageFill, type StorageTone } from "@/lib/storage-fill";
import { getEffectiveStorageLimit } from "@/lib/user-quota";
import { PageHeader } from "../PageHeader";
import { UpgradeModal } from "../UpgradeModal";
import { StorageItems } from "./StorageItems";

export const dynamic = "force-dynamic";

const LIST_LIMIT = 100;

const METER_COLOR: Record<StorageTone, "success" | "warning" | "danger"> = {
  ok: "success",
  near: "warning",
  full: "danger",
};

export default async function StoragePage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const [usedBytes, limit, items] = await Promise.all([
    env?.DB ? totalStorageForUser(env.DB, session.user.id) : 0,
    getEffectiveStorageLimit(session.user.id),
    env?.DB ? listStorageItemsForUser(env.DB, session.user.id, LIST_LIMIT) : [],
  ]);
  const limitBytes = limit >= UNLIMITED_STORAGE_BYTES ? null : limit;
  const fill = storageFill(usedBytes, limitBytes);
  const canUpgrade = !isSelfHosted(env) && fill !== null && fill.tone !== "ok";

  return (
    <div className="mx-auto max-w-[880px]">
      <PageHeader
        title="Storage"
        subtitle={
          limitBytes === null
            ? `${formatBytes(usedBytes)} used, no limit.`
            : `${formatBytes(usedBytes)} of ${formatBytes(limitBytes)} used.`
        }
        showRecord={false}
        actions={
          canUpgrade ? (
            <UpgradeModal
              email={session.user.email}
              userId={session.user.id}
              trigger={
                <Button variant="primary">
                  <Sparkles size={16} />
                  Get more storage
                </Button>
              }
            />
          ) : undefined
        }
      />

      <div className="mt-6 flex flex-col gap-8">
        <Section label="Usage">
          <div className="flex items-baseline justify-between gap-3">
            <Typography type="body-sm" weight="medium">
              Recordings and screenshots in workspaces you own
            </Typography>
            <Typography type="body-sm" color="muted" className="tabular-nums">
              {limitBytes === null
                ? formatBytes(usedBytes)
                : `${formatBytes(usedBytes)} of ${formatBytes(limitBytes)}`}
            </Typography>
          </div>
          {fill && (
            <ProgressBar
              value={Math.round(fill.ratio * 100)}
              color={METER_COLOR[fill.tone]}
              aria-label="Storage used"
              className="mt-2"
            >
              <ProgressBar.Track className="h-1.5 rounded-full bg-tint-strong">
                <ProgressBar.Fill className="rounded-full" />
              </ProgressBar.Track>
            </ProgressBar>
          )}
          {limitBytes !== null && limitBytes <= 0 && (
            <Typography type="body-sm" color="muted" className="mt-2 block">
              Cloud storage is a Pro feature.
            </Typography>
          )}
        </Section>

        <Section
          label="What takes up space"
          hint={
            items.length >= LIST_LIMIT
              ? `The ${LIST_LIMIT} largest files.`
              : undefined
          }
        >
          <StorageItems items={items} />
        </Section>
      </div>
    </div>
  );
}

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <Typography type="body-sm" weight="semibold">
          {label}
        </Typography>
        {hint && (
          <Typography type="body-xs" color="muted">
            {hint}
          </Typography>
        )}
      </div>
      <Card className="p-5">{children}</Card>
    </section>
  );
}
