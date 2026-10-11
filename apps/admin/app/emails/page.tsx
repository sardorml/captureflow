import NextLink from "next/link";
import { Plus } from "lucide-react";
import { Table, buttonVariants } from "@heroui/react";
import {
  countRecipients,
  countUnsubscribed,
  listCampaigns,
} from "@captureflow/mail";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { DataTable, Notice, PageHeading, Stat, formatDate } from "../_ui";
import { StatusChip } from "./_status";

export default async function EmailsPage() {
  await requirePermission("mail.send");
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <PageHeading title="Emails">
          Product updates to your users. Drafts stay private until you send
          them.
        </PageHeading>
        <NextLink
          href="/emails/new"
          className={buttonVariants({ variant: "primary", className: "gap-2" })}
        >
          <Plus size={16} aria-hidden />
          New email
        </NextLink>
      </div>

      {!env?.MAIL_QUEUE && (
        <Notice tone="error">
          This deployment has no MAIL_QUEUE binding, so drafts can be written
          but not sent. Deploy apps/mailer to enable sending.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Subscribed" value={String(subscribed)} />
        <Stat label="Unsubscribed" value={String(unsubscribed)} />
        <Stat label="Emails delivered" value={String(delivered)} />
      </div>

      {campaigns.length === 0 ? (
        <div className="border-line flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
          <p className="text-fg-strong text-sm font-medium">No emails yet</p>
          <p className="text-fg-muted max-w-sm text-sm">
            Write one, send yourself a test, then send it to everyone or to the
            people you pick.
          </p>
        </div>
      ) : (
        <DataTable
          label="Emails"
          columns={[
            "Subject",
            "Status",
            "Sent",
            "Failed",
            "Created",
            "Sent on",
          ]}
        >
          {campaigns.map((c) => (
            <Table.Row key={c.id}>
              <Table.Cell className="font-medium">
                <NextLink href={`/emails/${c.id}`} className="hover:underline">
                  {c.subject}
                </NextLink>
              </Table.Cell>
              <Table.Cell>
                <StatusChip status={c.status} />
              </Table.Cell>
              <Table.Cell className="tabular-nums">{c.sentCount}</Table.Cell>
              <Table.Cell className="tabular-nums">{c.failedCount}</Table.Cell>
              <Table.Cell className="text-fg-muted tabular-nums whitespace-nowrap">
                {formatDate(c.createdAt)}
              </Table.Cell>
              <Table.Cell className="text-fg-muted tabular-nums whitespace-nowrap">
                {formatDate(c.startedAt)}
              </Table.Cell>
            </Table.Row>
          ))}
        </DataTable>
      )}
    </div>
  );
}
