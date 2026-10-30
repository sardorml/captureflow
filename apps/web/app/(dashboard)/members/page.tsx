import {
  listMembers,
  listPendingInvites,
  listSeatRequests,
} from "@captureflow/quota";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { requireSession } from "@/lib/session-guard";
import { getAppWebEnv } from "@/lib/cf-env";
import { resolveCurrentWorkspace } from "@/lib/current-workspace";
import { getWorkspaceSeatContext, paidSeatsOf } from "@/lib/billing/seats";
import { WorkspacePageHeader } from "../WorkspacePageHeader";
import { MembersTable } from "./MembersTable";
import { SeatSummary } from "./SeatSummary";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  const session = await requireSession();
  const env = await getAppWebEnv();
  const current = await resolveCurrentWorkspace(
    session.user.id,
    session.user.name ?? null,
  );
  const workspace = current.workspace;
  const isOwner = current.role === "owner";

  if (!env?.DB) {
    return (
      <div className="flex flex-col gap-8">
        <WorkspacePageHeader workspaceName={workspace.name} title="Members" />
        <Alert>
          <AlertTitle>Database unavailable.</AlertTitle>
        </Alert>
      </div>
    );
  }

  const [members, pending, seats, seatRequests] = await Promise.all([
    listMembers(env.DB, workspace.id),
    isOwner ? listPendingInvites(env.DB, workspace.id) : Promise.resolve([]),
    getWorkspaceSeatContext(workspace),
    isOwner ? listSeatRequests(env.DB, workspace.id) : Promise.resolve([]),
  ]);

  const paidSeats = paidSeatsOf(seats);

  return (
    <div className="flex flex-col gap-8">
      <WorkspacePageHeader workspaceName={workspace.name} title="Members" />
      {seats ? (
        <SeatSummary
          context={seats}
          isOwner={isOwner}
          email={session.user.email}
          userId={session.user.id}
        />
      ) : null}
      <MembersTable
        members={members}
        invites={pending}
        viewerUserId={session.user.id}
        viewerIsOwner={isOwner}
        workspaceName={workspace.name}
        paidSeats={paidSeats}
        seatRequests={seatRequests}
      />
    </div>
  );
}
