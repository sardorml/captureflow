import type { AdminAccessRow, AdminUserAccess } from "@captureflow/admin";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DataTable,
  Empty,
  FormCard,
  Stat,
  StatGrid,
  Tone,
  formatDate,
  formatRelative,
} from "../../_ui";

function Kind({ isBackground }: { isBackground: boolean }) {
  return (
    <Tone color={isBackground ? "default" : "success"}>
      {isBackground ? "background" : "user action"}
    </Tone>
  );
}

function AccessSummary({
  title,
  row,
  now,
}: {
  title: string;
  row: AdminAccessRow | null;
  now: number;
}) {
  return (
    <FormCard title={title}>
      {row ? (
        <div className="flex flex-col gap-1 text-sm">
          <span className="text-fg-strong font-medium">{row.routeLabel}</span>
          <span className="text-fg-muted">
            {formatRelative(row.lastAt, now)} · {formatDate(row.lastAt)} UTC
          </span>
          <span className="text-fg-muted">
            via {row.credential}
            {row.place ? ` · ${row.place}` : ""}
            {row.ip ? ` · ${row.ip}` : ""}
          </span>
          <code className="text-fg-subtle text-xs">{row.route}</code>
        </div>
      ) : (
        <p className="text-fg-muted text-sm">Nothing logged yet.</p>
      )}
    </FormCard>
  );
}

export function AccessPanel({
  data,
  now,
}: {
  data: AdminUserAccess;
  now: number;
}) {
  const { lastActive, totals } = data;
  return (
    <div className="flex flex-col gap-6">
      <FormCard
        title="Why they show as active"
        description="Active is the newest web session refresh or device token use. Below is the request that set it."
      >
        {lastActive ? (
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-fg-strong font-medium">
                {formatRelative(lastActive.at, now)}
              </span>
              <span className="text-fg-muted">
                {formatDate(lastActive.at)} UTC
              </span>
              <Tone color="default">
                {lastActive.via === "session" ? "web session" : "device token"}
              </Tone>
              {lastActive.access ? (
                <Kind isBackground={lastActive.access.isBackground} />
              ) : (
                <Tone color="warning">not in log</Tone>
              )}
            </div>
            <p className="text-fg-muted max-w-3xl">{lastActive.explanation}</p>
          </div>
        ) : (
          <p className="text-fg-muted text-sm">Never active.</p>
        )}
        {!data.hasLog && (
          <p className="text-warning mt-3 text-sm">
            The access log table is missing. Apply migration
            0040_user_access.sql to start recording requests.
          </p>
        )}
      </FormCard>

      <StatGrid columns={4}>
        <Stat
          label="Requests, 30 days"
          value={totals.requests30d.toLocaleString()}
          hint={`${totals.backgroundRequests30d.toLocaleString()} were background checks`}
        />
        <Stat
          label="Days with any request"
          value={String(totals.activeDays30d)}
          hint="Last 30 days, background included"
        />
        <Stat
          label="Days they did something"
          value={String(totals.foregroundDays30d)}
          hint="Opened a page, recorded, uploaded, commented"
        />
        <Stat
          label="Live sessions"
          value={String(data.sessions.filter((s) => s.isLive).length)}
          hint={`${data.devices.filter((d) => !d.revokedAt).length} connected devices`}
        />
      </StatGrid>

      <div className="grid gap-5 lg:grid-cols-2">
        <AccessSummary
          title="Last thing they did"
          row={data.lastForeground}
          now={now}
        />
        <AccessSummary
          title="Last background check"
          row={data.lastBackground}
          now={now}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg-strong text-sm font-semibold">Web sessions</h3>
        {data.sessions.length === 0 ? (
          <Empty title="No web sessions" />
        ) : (
          <DataTable
            label="Web sessions"
            columns={[
              "Browser",
              "Signed in",
              "Last refreshed",
              "Last request",
              "Requests",
              "IP",
              "Expires",
              "State",
            ]}
          >
            {data.sessions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <span
                    className="text-fg-strong font-medium"
                    title={s.userAgent ?? undefined}
                  >
                    {s.client}
                  </span>
                </TableCell>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={formatDate(s.createdAt)}
                >
                  {formatRelative(s.createdAt, now)}
                </TableCell>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={formatDate(s.updatedAt)}
                >
                  {formatRelative(s.updatedAt, now)}
                </TableCell>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={formatDate(s.lastSeenAt)}
                >
                  {s.lastSeenAt ? formatRelative(s.lastSeenAt, now) : "—"}
                </TableCell>
                <TableCell className="tabular-nums">{s.requests}</TableCell>
                <TableCell className="text-fg-muted font-mono text-xs">
                  {s.ipAddress ?? "—"}
                </TableCell>
                <TableCell className="text-fg-muted whitespace-nowrap">
                  {formatDate(s.expiresAt).slice(0, 10)}
                </TableCell>
                <TableCell>
                  <Tone color={s.isLive ? "success" : "default"}>
                    {s.isLive ? "live" : "expired"}
                  </Tone>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg-strong text-sm font-semibold">
          Devices and apps
        </h3>
        {data.devices.length === 0 ? (
          <Empty title="No extension, desktop app or MCP connected" />
        ) : (
          <DataTable
            label="Devices"
            columns={["Device", "Connected", "Last used", "Requests", "State"]}
          >
            {data.devices.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="text-fg-strong font-medium">
                  {d.label}
                </TableCell>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={formatDate(d.createdAt)}
                >
                  {formatRelative(d.createdAt, now)}
                </TableCell>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={formatDate(d.lastUsedAt)}
                >
                  {formatRelative(d.lastUsedAt, now)}
                </TableCell>
                <TableCell className="tabular-nums">{d.requests}</TableCell>
                <TableCell>
                  <Tone color={d.revokedAt ? "default" : "success"}>
                    {d.revokedAt
                      ? `revoked ${formatRelative(d.revokedAt, now)}`
                      : "connected"}
                  </Tone>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="text-fg-strong text-sm font-semibold">
          Request log
          <span className="text-fg-subtle ml-2 font-normal">
            grouped by hour, newest first, last 90 days
          </span>
        </h3>
        {data.access.length === 0 ? (
          <Empty title="No requests logged yet">
            Every signed-in request is logged from now on: page views, actions,
            uploads and the background checks the extension, desktop app, MCP
            and open browser tabs make.
          </Empty>
        ) : (
          <DataTable
            label="Request log"
            columns={[
              "When",
              "What",
              "Kind",
              "Through",
              "Hits",
              "Where",
              "Client",
            ]}
          >
            {data.access.map((a) => (
              <TableRow key={a.key}>
                <TableCell
                  className="text-fg-muted whitespace-nowrap"
                  title={`${formatDate(a.firstAt)} → ${formatDate(a.lastAt)} UTC`}
                >
                  {formatRelative(a.lastAt, now)}
                </TableCell>
                <TableCell>
                  <div className="text-fg-strong">{a.routeLabel}</div>
                  <code className="text-fg-subtle text-xs">{a.route}</code>
                </TableCell>
                <TableCell>
                  <Kind isBackground={a.isBackground} />
                </TableCell>
                <TableCell className="text-fg-muted whitespace-nowrap">
                  {a.credential}
                  <div className="text-fg-subtle text-xs">
                    {a.via === "session" ? "web session" : "device token"}
                  </div>
                </TableCell>
                <TableCell className="tabular-nums">{a.hits}</TableCell>
                <TableCell className="text-fg-muted whitespace-nowrap">
                  {a.place ?? "—"}
                  <div className="text-fg-subtle font-mono text-xs">
                    {a.ip ?? ""}
                  </div>
                </TableCell>
                <TableCell className="text-fg-muted whitespace-nowrap">
                  {a.client ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </section>
    </div>
  );
}
