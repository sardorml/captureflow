import { notFound } from "next/navigation";
import NextLink from "next/link";
import {
  countRecipients,
  getCampaign,
  hydrateCampaignId,
  listAudience,
  renderCampaign,
  selectedEmails,
} from "@captureflow/mail";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { Notice, PageHeading, Panel, Stat, formatDate } from "../../_ui";
import {
  Composer,
  DeleteDraftButton,
  SendCampaignForm,
  SendTestForm,
} from "../_forms";
import { updateCampaignAction } from "../actions";
import { StatusChip } from "../_status";

export default async function CampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("mail.send");
  const env = await getAdminEnv();
  const id = hydrateCampaignId((await params).id);
  if (!env?.DB || !id) notFound();
  const campaign = await getCampaign(env.DB, id);
  if (!campaign) notFound();
  const [recipients, emails, members] = await Promise.all([
    countRecipients(env.DB, id),
    selectedEmails(env.DB, id),
    campaign.status === "draft" ? listAudience(env.DB) : Promise.resolve([]),
  ]);

  const header = (
    <>
      <NextLink
        href="/emails"
        className="text-fg-muted w-fit text-sm hover:underline"
      >
        ← Emails
      </NextLink>
      <div className="flex items-start justify-between gap-4">
        <PageHeading title={campaign.subject}>
          Drafted by {campaign.createdBy} on {formatDate(campaign.createdAt)}
        </PageHeading>
        <StatusChip status={campaign.status} />
      </div>
    </>
  );

  if (campaign.status !== "draft") {
    const preview = renderCampaign({
      subject: campaign.subject,
      body: campaign.body,
      unsubscribeUrl: "https://mail.captureflow.dev/unsubscribe",
    });
    return (
      <div className="flex flex-col gap-6">
        {header}
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat label="Sent" value={String(campaign.sentCount)} />
          <Stat label="Failed" value={String(campaign.failedCount)} />
          <Stat
            label="Audience"
            value={
              campaign.audience === "all"
                ? "Everyone"
                : `${emails.length} picked`
            }
          />
          <Stat
            label={campaign.status === "sent" ? "Finished" : "Started"}
            value={formatDate(campaign.finishedAt ?? campaign.startedAt)}
            hint={
              campaign.status === "sending"
                ? "Refresh for progress. About 100 a minute."
                : undefined
            }
          />
        </div>
        <Panel title="Preview">
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            sandbox=""
            className="h-[520px] w-full rounded-lg border-0 bg-white"
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      <Composer
        action={updateCampaignAction}
        submit="Save draft"
        members={members}
        id={campaign.id}
        initial={{
          subject: campaign.subject,
          body: campaign.body,
          audience: campaign.audience,
          emails,
        }}
        aside={
          <>
            {!env.MAIL_QUEUE && (
              <Notice tone="error">
                Sending is off: this deployment has no MAIL_QUEUE binding.
              </Notice>
            )}
            <Panel
              title="Test"
              description="Sends the saved draft to your own address, marked [Test]."
            >
              <SendTestForm id={campaign.id} />
            </Panel>
            <Panel
              title="Send"
              description={
                campaign.audience === "all"
                  ? `Everyone who hasn't unsubscribed: ${recipients} right now.`
                  : `The ${recipients} people you picked who haven't unsubscribed.`
              }
            >
              <SendCampaignForm id={campaign.id} recipients={recipients} />
            </Panel>
            <div>
              <DeleteDraftButton id={campaign.id} />
            </div>
          </>
        }
      />
    </div>
  );
}
