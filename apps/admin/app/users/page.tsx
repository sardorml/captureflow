import NextLink from "next/link";
import { Button, Input, Table, TextField } from "@heroui/react";
import { listAdminUsers } from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import { DataTable, PageHeading, formatBytes, formatDate } from "../_ui";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("users.read");
  const q = (await searchParams).q ?? "";
  const env = await getAdminEnv();
  const users = env?.DB ? await listAdminUsers(env.DB, q) : [];

  return (
    <div className="flex flex-col gap-5">
      <PageHeading title="Users">
        Everyone with a product account, with what they have stored.
      </PageHeading>

      {/* A GET form, so the search term stays in the URL and stays shareable —
          unlike a failure, which belongs in the page. */}
      <form className="flex items-end gap-2" action="/users">
        <TextField name="q" defaultValue={q} aria-label="Search users">
          <Input placeholder="Search name or email" className="max-w-sm" />
        </TextField>
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>

      <DataTable
        label="Users"
        columns={["User", "Joined", "Recordings", "Screenshots", "Stored"]}
      >
        {users.map((u) => (
          <Table.Row key={u.id}>
            <Table.Cell>
              <NextLink
                href={`/users/${u.id}`}
                className="font-medium hover:underline"
              >
                {u.name || u.email}
              </NextLink>
              <div className="text-fg-subtle text-xs">{u.email}</div>
            </Table.Cell>
            <Table.Cell className="tabular-nums">
              {formatDate(u.createdAt)}
            </Table.Cell>
            <Table.Cell className="tabular-nums">{u.recordingCount}</Table.Cell>
            <Table.Cell className="tabular-nums">
              {u.screenshotCount}
            </Table.Cell>
            <Table.Cell className="tabular-nums">
              {formatBytes(u.storageBytes)}
            </Table.Cell>
          </Table.Row>
        ))}
      </DataTable>
    </div>
  );
}
