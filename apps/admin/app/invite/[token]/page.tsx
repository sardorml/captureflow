import {
  ROLE_SUMMARY,
  getPendingInvite,
  hashToken,
  hydrateInviteToken,
} from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
import { AuthCard } from "../../_ui";
import { AcceptForm } from "./AcceptForm";

export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const token = hydrateInviteToken((await params).token);
  const env = await getAdminEnv();
  const invite =
    token && env?.DB
      ? await getPendingInvite(env.DB, await hashToken(token))
      : null;

  return invite && token ? (
    <AuthCard
      title="Accept your invite"
      description={`${invite.email} · ${invite.role}: ${ROLE_SUMMARY[invite.role]}`}
    >
      <AcceptForm token={token} />
    </AuthCard>
  ) : (
    <AuthCard
      title="Invite not valid"
      description="This link has expired, has already been used, or was never issued. Ask an owner to send a new one."
    />
  );
}
