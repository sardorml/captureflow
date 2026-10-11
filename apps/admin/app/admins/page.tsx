import { listAdmins, listPendingInvites } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { DataTable, Empty, PageHeader } from "../_ui";
import { PanelTabs } from "../_filters";
import { AdminRow } from "./AdminRow";
import { InviteDialog } from "./InviteForm";
import { InviteRow } from "./InviteRow";

export default async function AdminsPage() {
  const operator = await requirePermission("admins.manage");
  const env = await getAdminEnv();
  const [admins, invites] = env?.DB
    ? await Promise.all([listAdmins(env.DB), listPendingInvites(env.DB)])
    : [[], []];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Admins"
        description="People who can sign in here. Separate from product accounts."
        actions={<InviteDialog />}
      />

      <PanelTabs
        label="Admins"
        items={[
          {
            id: "active",
            label: `Admins · ${admins.length}`,
            content: (
              <div className="flex flex-col gap-3">
                <DataTable
                  label="Admins"
                  columns={["Admin", "Role", "Status", "Last sign-in", ""]}
                >
                  {admins.map((a) => (
                    <AdminRow
                      key={a.id}
                      admin={a}
                      isSelf={a.id === operator.id}
                    />
                  ))}
                </DataTable>
                <p className="text-fg-subtle text-xs">
                  You can&apos;t change or remove your own account, so the
                  deployment always keeps an owner.
                </p>
              </div>
            ),
          },
          {
            id: "invites",
            label: `Pending invites · ${invites.length}`,
            content:
              invites.length === 0 ? (
                <Empty title="No pending invites">
                  Invites you send show up here until they&apos;re accepted or
                  expire.
                </Empty>
              ) : (
                <DataTable
                  label="Pending invites"
                  columns={["Email", "Role", "Invited by", "Expires", ""]}
                >
                  {invites.map((i) => (
                    <InviteRow key={i.tokenHash} invite={i} />
                  ))}
                </DataTable>
              ),
          },
        ]}
      />
    </div>
  );
}
