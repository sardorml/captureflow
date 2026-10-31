import { getActivation } from "@captureflow/admin";
import { getAdminEnv } from "@/lib/env";
import { requirePermission } from "@/lib/guard";
import { Panel } from "../_dashboard";
import {
  DataTable,
  Notice,
  PageHeader,
  PersonCell,
  Section,
  formatRelative,
} from "../_ui";
import { TableCell, TableRow } from "@/components/ui/table";
import { BarList, CohortTable, FunnelSteps, pct } from "./_parts";

const WEEKS = 8;

export default async function AnalyticsPage() {
  await requirePermission("users.read");
  const env = await getAdminEnv();
  if (!env?.DB) return <Notice tone="error">No database binding.</Notice>;
  const now = Date.now();
  const activation = await getActivation(env.DB, WEEKS, now);
  const { funnel } = activation;

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Analytics"
        description="Who signs up, who records, and who comes back"
      />

      <Section
        title="Activation"
        description={`Everyone who signed up in the last ${WEEKS} weeks`}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <Panel title="Funnel" description="Each step out of all signups">
            <FunnelSteps
              steps={[
                {
                  label: "Signed up",
                  count: funnel.signedUp,
                  hint: "Created an account",
                },
                {
                  label: "Recorded",
                  count: funnel.recorded,
                  hint: "Finished at least one recording",
                },
                {
                  label: "Recorded again",
                  count: funnel.recordedTwice,
                  hint: "Finished two or more",
                },
                {
                  label: "Came back",
                  count: funnel.returned,
                  hint: "Active on a later day than signup",
                },
              ]}
            />
          </Panel>
          <Panel
            title="Weekly retention"
            description="Share of each signup week active in the weeks after"
          >
            <CohortTable cohorts={activation.cohorts} />
            <p className="text-xs text-muted-foreground">
              Active means signed in, recorded, took a screenshot, watched or
              commented.
            </p>
          </Panel>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Panel
            title="Time to first recording"
            description="How long after signing up"
          >
            <BarList
              rows={activation.timeToFirstRecording.map((b) => ({
                key: b.label,
                label: b.label,
                value: b.count,
                detail: pct(b.count, funnel.signedUp),
              }))}
            />
          </Panel>
          <Panel
            title="First recording made with"
            description="Where people record for the first time"
          >
            <BarList
              rows={activation.firstClient.map((b) => ({
                key: b.label,
                label: b.label,
                value: b.count,
                detail: pct(b.count, funnel.recorded),
              }))}
              empty="Nobody has recorded yet"
            />
          </Panel>
        </div>
      </Section>

      <Section
        title="Recorded once, never came back"
        description="One recording, then nothing after their signup day"
      >
        {activation.oneAndDone.length ? (
          <DataTable
            label="Recorded once, never came back"
            columns={["User", "Recorded", "Signed up"]}
          >
            {activation.oneAndDone.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <PersonCell id={u.id} name={u.name ?? ""} email={u.email} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelative(u.firstRecordingAt, now)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatRelative(u.createdAt, now)}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        ) : (
          <p className="text-sm text-muted-foreground">Nobody fits this yet.</p>
        )}
      </Section>
    </div>
  );
}
