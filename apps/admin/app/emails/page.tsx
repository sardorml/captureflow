import NextLink from "next/link";
import { Mail, Plus } from "lucide-react";
import { Table, buttonVariants } from "@heroui/react";
import {
  type CampaignStatus,
  countRecipients,
  countUnsubscribed,
  listCampaigns,
} from "@captureflow/mail";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  Notice,
  PageHeader,
  Stat,
  StatGrid,
  formatRelative,
  queryString,
} from "../_ui";
import { LinkTabs } from "../_filters";
import { RowMenu } from "../_row-menu";
import { StatusChip } from "./_status";
import { deleteCampaignAction } from "./actions";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Drafts" },
  { id: "sent", label: "Sent" },
] as const;

const NEW_EMAIL = (
  <NextLink
    href="/emails/new"
    className={buttonVariants({ variant: "primary", className: "gap-2" })}
  >
    <Plus size={16} aria-hidden />
    New email
  </NextLink>
);

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requirePermission("mail.send");
  const { status } = await searchParams;
  const filter = FILTERS.find((f) => f.id === status)?.id ?? "all";
  const env = await getAdminEnv();
  const db = env?.DB;
  const [campaigns, subscribed, unsubscribed] = db
    ? await Promise.all([
        listCampaigns(db),
        countRecipients(db),
        countUnsubscribed(db),
      ])
    : [[], 0, 0];
  const delivered = campaigns.reduce((n, c) => n + c.sentCount, 0);
  const matches = (s: CampaignStatus) =>
    filter === "all" || (filter === "draft" ? s === "draft" : s !== "draft");
  const shown = campaigns.filter((c) => matches(c.status));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Emails" actions={NEW_EMAIL} />

      {!env?.MAIL_QUEUE && (
        <Notice tone="error">
          This deployment has no MAIL_QUEUE binding, so drafts can be written
          but not sent. Deploy apps/mailer to enable sending.
        </Notice>
      )}

      <StatGrid columns={3}>
        <Stat
          label="Subscribed"
          value={subscribed.toLocaleString()}
          hint="Would get an email sent to everyone"
        />
        <Stat
          label="Unsubscribed"
          value={unsubscribed.toLocaleString()}
          hint="Never emailed again"
        />
        <Stat
          label="Delivered"
          value={delivered.toLocaleString()}
          hint={`Across ${campaigns.length} ${campaigns.length === 1 ? "email" : "emails"}`}
        />
      </StatGrid>

      <div className="flex flex-col gap-4">
        <LinkTabs
          label="Email status"
          selected={filter}
          items={FILTERS.map((f) => ({
            id: f.id,
            label: f.label,
            href: `/emails${queryString({ status: f.id })}`,
          }))}
        />
        {shown.length === 0 ? (
          <Empty
            title={filter === "all" ? "No emails yet" : "Nothing here"}
            action={filter === "all" ? NEW_EMAIL : undefined}
          >
            {filter === "all"
              ? "Write one, send yourself a test, then send it to everyone or to the people you pick."
              : undefined}
          </Empty>
        ) : (
          <DataTable
            label="Emails"
            columns={[
              "Subject",
              "Status",
              "Audience",
              "Delivered",
              "Updated",
              "",
            ]}
          >
            {shown.map((c) => (
              <Table.Row key={c.id}>
                <Table.Cell>
                  <div className="flex items-center gap-3">
                    <span className="border-line bg-canvas-2 text-fg-muted grid size-9 shrink-0 place-items-center rounded-lg border">
                      <Mail size={16} aria-hidden />
                    </span>
                    <NextLink
                      href={`/emails/${c.id}`}
                      className="text-fg-strong truncate font-medium hover:underline"
                    >
                      {c.subject}
                    </NextLink>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <StatusChip status={c.status} />
                </Table.Cell>
                <Table.Cell className="text-fg-muted">
                  {c.audience === "all" ? "Everyone" : "Selected people"}
                </Table.Cell>
                <Table.Cell className="tabular-nums whitespace-nowrap">
                  {c.status === "draft" ? (
                    <span className="text-fg-subtle">—</span>
                  ) : (
                    <>
                      {c.sentCount}
                      {c.failedCount > 0 && (
                        <span className="text-danger">
                          {" "}
                          · {c.failedCount} failed
                        </span>
                      )}
                    </>
                  )}
                </Table.Cell>
                <Table.Cell className="text-fg-muted whitespace-nowrap">
                  {formatRelative(c.finishedAt ?? c.startedAt ?? c.createdAt)}
                </Table.Cell>
                <Table.Cell>
                  {c.status === "draft" && (
                    <RowMenu
                      label={`Actions for ${c.subject}`}
                      actions={[
                        {
                          id: "delete",
                          label: "Delete draft",
                          danger: true,
                          confirm: `Delete the draft "${c.subject}"?`,
                          action: deleteCampaignAction,
                          fields: { id: c.id },
                        },
                      ]}
                    />
                  )}
                </Table.Cell>
              </Table.Row>
            ))}
          </DataTable>
        )}
      </div>
    </div>
  );
}
