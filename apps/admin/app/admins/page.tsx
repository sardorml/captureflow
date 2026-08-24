import { listAdmins, listPendingInvites } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { DataTable, PageHeading, SectionHeading } from "../_ui";
import { AdminRow } from "./AdminRow";
import { InviteForm } from "./InviteForm";
import { InviteRow } from "./InviteRow";

export default async function AdminsPage() {
  const operator = await requirePermission("admins.manage");
  const env = await getAdminEnv();
  const [admins, invites] = env?.DB
    ? await Promise.all([listAdmins(env.DB), listPendingInvites(env.DB)])
    : [[], []];

  return (
    <div className="flex flex-col gap-8">
      <PageHeading title="Admins">
        Accounts that can sign in here. Separate from product users — an admin
        row grants nothing inside the app.
      </PageHeading>

      <section className="border-line bg-panel flex flex-col gap-4 rounded-xl border p-5">
        <SectionHeading title="Invite an admin" />
        <InviteForm />
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading title="Active admins" />
        <DataTable
          label="Active admins"
          columns={["Admin", "Role", "Last sign-in", ""]}
        >
          {admins.map((a) => (
            <AdminRow key={a.id} admin={a} isSelf={a.id === operator.id} />
          ))}
        </DataTable>
        <p className="text-fg-subtle text-xs">
          You cannot change or remove your own account — that rule is what keeps
          the deployment from ending up with no owner.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <SectionHeading title="Pending invites" />
        {invites.length === 0 ? (
          <p className="text-fg-muted text-sm">No invites waiting.</p>
        ) : (
          <DataTable
            label="Pending invites"
            columns={["Email", "Role", "Invited by", "Expires", ""]}
          >
            {invites.map((i) => (
              <InviteRow key={i.tokenHash} invite={i} />
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
