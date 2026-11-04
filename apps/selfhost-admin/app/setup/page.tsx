import { notFound } from "next/navigation";
import {
  getInstanceSignupState,
  isInstanceAdmin,
} from "@captureflow/selfhost/instance";
import { getEnv } from "@/lib/env";
import { currentUser } from "@/lib/session";
import { SetupWizard } from "./wizard";

/*
 * A fresh install starts the wizard from the top. Once the admin account
 * exists the page re-renders after each step, so the admin resumes past the
 * account step; after the last step it opens on the done screen.
 */
export default async function SetupPage() {
  const env = getEnv();
  const state = await getInstanceSignupState(env.DB);
  let initialStep = 0;
  if (!state.firstRun) {
    const user = await currentUser();
    if (!user || !(await isInstanceAdmin(env.DB, user.id))) notFound();
    initialStep = state.setupCompleted ? 5 : 2;
  }
  return (
    <SetupWizard
      appUrl={env.APP_URL}
      mailConfigured={env.MAIL_CONFIGURED}
      initialStep={initialStep}
    />
  );
}
