import {
  ROLE_SUMMARY,
  getPendingInvite,
  hashToken,
  hydrateInviteToken,
} from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
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

  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-sm flex-col justify-center gap-6">
      {invite && token ? (
        <>
          <div>
            <h1 className="text-xl font-semibold">Accept your invite</h1>
            <p className="text-fg-muted mt-1 text-sm">
              {invite.email} · {invite.role} — {ROLE_SUMMARY[invite.role]}
            </p>
          </div>
          <AcceptForm token={token} />
        </>
      ) : (
        <div>
          <h1 className="text-xl font-semibold">Invite not valid</h1>
          <p className="text-fg-muted mt-1 text-sm">
            This link has expired, has already been used, or was never issued.
            Ask an owner to send a new one.
          </p>
        </div>
      )}
    </div>
  );
}
