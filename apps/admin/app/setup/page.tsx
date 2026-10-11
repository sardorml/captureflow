import { redirect } from "next/navigation";
import { countAdmins } from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
import { AuthCard } from "../_ui";
import { SetupForm } from "./SetupForm";

export default async function SetupPage() {
  const env = await getAdminEnv();
  // Setup closes permanently once the deployment has an owner.
  if (env?.DB && (await countAdmins(env.DB)) > 0) redirect("/login");

  return (
    <AuthCard
      title="Set up the instance admin"
      description="This deployment has no admins yet. Claim it to create the owner account, then invite everyone else from there."
    >
      <SetupForm configured={Boolean(env?.ADMIN_SETUP_TOKEN?.trim())} />
    </AuthCard>
  );
}
