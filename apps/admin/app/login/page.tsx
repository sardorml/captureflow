import { redirect } from "next/navigation";
import { countAdmins } from "@captureflow/admin";
import { currentOperator } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await currentOperator()) redirect("/");
  const env = await getAdminEnv();
  if (env?.DB && (await countAdmins(env.DB)) === 0) redirect("/setup");

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-sm flex-col justify-center gap-6">
      <div>
        <h1 className="text-xl font-semibold">Instance admin</h1>
        <p className="text-fg-muted mt-1 text-sm">
          For whoever operates this deployment. Not a product account.
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
