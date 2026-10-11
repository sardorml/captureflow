import { listAudience } from "@captureflow/mail";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { PageHeader } from "../../_ui";
import { Composer } from "../_forms";
import { createCampaignAction } from "../actions";

export default async function NewEmailPage() {
  await requirePermission("mail.send");
  const env = await getAdminEnv();
  const members = env?.DB ? await listAudience(env.DB) : [];
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="New email"
        description="Saved as a draft. You can test it before anyone else sees it."
        back={{ href: "/emails", label: "Emails" }}
      />
      <Composer
        action={createCampaignAction}
        submit="Save draft"
        members={members}
        initial={{ subject: "", body: "", audience: "all", emails: [] }}
      />
    </div>
  );
}
