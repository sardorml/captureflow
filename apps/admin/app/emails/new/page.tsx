import NextLink from "next/link";
import { listAudience } from "@captureflow/mail";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { PageHeading } from "../../_ui";
import { Composer } from "../_forms";
import { createCampaignAction } from "../actions";

export default async function NewEmailPage() {
  await requirePermission("mail.send");
  const env = await getAdminEnv();
  const members = env?.DB ? await listAudience(env.DB) : [];
  return (
    <div className="flex flex-col gap-6">
      <NextLink
        href="/emails"
        className="text-fg-muted w-fit text-sm hover:underline"
      >
        ← Emails
      </NextLink>
      <PageHeading title="New email">
        Saved as a draft. You can test it before anyone else sees it.
      </PageHeading>
      <Composer
        action={createCampaignAction}
        submit="Save draft"
        members={members}
        initial={{ subject: "", body: "", audience: "all", emails: [] }}
      />
    </div>
  );
}
