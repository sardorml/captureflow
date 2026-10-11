import { redirect } from "next/navigation";
import { countAdmins } from "@captureflow/admin";
import { currentOperator } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { AuthCard } from "../_ui";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  if (await currentOperator()) redirect("/");
  const env = await getAdminEnv();
  if (env?.DB && (await countAdmins(env.DB)) === 0) redirect("/setup");

  return (
    <AuthCard
      title="Sign in"
      description="For whoever operates this deployment. Not a product account."
    >
      <LoginForm />
    </AuthCard>
  );
}
