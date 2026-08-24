import { redirect } from "next/navigation";
import { countAdmins } from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
import { SetupForm } from "./SetupForm";

export default async function SetupPage() {
  const env = await getAdminEnv();
  // Setup closes permanently once the deployment has an owner.
  if (env?.DB && (await countAdmins(env.DB)) > 0) redirect("/login");

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-sm flex-col justify-center gap-6">
      <div>
        <h1 className="text-xl font-semibold">Set up the instance admin</h1>
        <p className="text-fg-muted mt-1 text-sm">
          This deployment has no admins yet. Claim it to create the owner
          account — everything else is invited from there.
        </p>
      </div>
      <SetupForm configured={Boolean(env?.ADMIN_SETUP_TOKEN?.trim())} />
    </div>
  );
}
