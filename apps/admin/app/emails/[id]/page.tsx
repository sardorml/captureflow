import { notFound } from "next/navigation";
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
import {
  FormCard,
  Notice,
  PageHeader,
  Stat,
  StatGrid,
  formatDate,
} from "../../_ui";
import {
  Composer,
  DeleteDraftButton,
  DuplicateButton,
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
    <PageHeader
      title={campaign.subject}
      description={`Drafted by ${campaign.createdBy} on ${formatDate(campaign.createdAt)}`}
      back={{ href: "/emails", label: "Emails" }}
      actions={
        <div className="flex items-center gap-3">
          <DuplicateButton id={campaign.id} />
          <StatusChip status={campaign.status} />
        </div>
      }
    />
  );

  if (campaign.status !== "draft") {
    const preview = renderCampaign({
      subject: campaign.subject,
      body: campaign.body,
      unsubscribeUrl: "https://mail.captureflow.dev/unsubscribe",
    });
    return (
      <div className="flex flex-col gap-8">
        {header}
        <StatGrid columns={4}>
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
        </StatGrid>
        <FormCard title="Preview">
          <iframe
            title="Email preview"
            srcDoc={preview.html}
            sandbox=""
            className="h-[560px] w-full rounded-lg border-0 bg-white"
          />
        </FormCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
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
            <FormCard
              title="Test"
              description="Sends the saved draft to your own address, marked [Test]."
            >
              <SendTestForm id={campaign.id} />
            </FormCard>
            <FormCard
              title="Send"
              description={
                campaign.audience === "all"
                  ? `Everyone who hasn't unsubscribed: ${recipients} right now.`
                  : `The ${recipients} people you picked who haven't unsubscribed.`
              }
            >
              <SendCampaignForm id={campaign.id} recipients={recipients} />
            </FormCard>
            <div>
              <DeleteDraftButton id={campaign.id} />
            </div>
          </>
        }
      />
    </div>
  );
}
