import NextLink from "next/link";
import { notFound } from "next/navigation";
import {
  Bot,
  Camera,
  CreditCard,
  Eye,
  Inbox,
  LogIn,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  ShieldCheck,
  SmilePlus,
  UserPlus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  can,
  getAdminUser,
  getLimitOverride,
  getUserActivity,
  getUserTimeline,
  listAuditForTarget,
  listUserSubscriptions,
  listUserWorkspaces,
  summarizeCapture,
  type AdminTimelineEvent,
  type AdminTimelineKind,
} from "@captureflow/admin";
import { requirePermission } from "@/lib/guard";
import { getAdminEnv } from "@/lib/env";
import {
  DataTable,
  Empty,
  FormCard,
  Monogram,
  PageHeader,
  PlanChip,
  RecordingCell,
  Stat,
  StatGrid,
  Tone,
  formatBytes,
  formatDate,
  formatDuration,
  formatRelative,
  shareUrl,
} from "../../_ui";
import { setUserLimitsAction } from "../../actions";
import { Feed, type FeedItem, type Hue } from "../../_dashboard";
import { PanelTabs } from "../../_filters";
import { LimitsCard } from "../../_limits-card";
import { SignOutEverywhere } from "./SignOutEverywhere";

const TIMELINE_ICON: Record<AdminTimelineKind, [LucideIcon, Hue]> = {
  signup: [UserPlus, "blue"],
  signin: [LogIn, "blue"],
  device: [MonitorSmartphone, "blue"],
  recording: [Video, "violet"],
  screenshot: [Camera, "violet"],
  agent: [Bot, "violet"],
  workspace: [Users, "emerald"],
  member: [Users, "emerald"],
  invite: [Mail, "emerald"],
  subscription: [CreditCard, "amber"],
  seats: [CreditCard, "amber"],
  seatRequest: [CreditCard, "amber"],
  comment: [MessageSquare, "violet"],
  reaction: [SmilePlus, "violet"],
  view: [Eye, "muted"],
  contact: [Inbox, "muted"],
  admin: [ShieldCheck, "amber"],
};

// The person's name leads each line, except where an admin acted on them.
function timelineItem(
  event: AdminTimelineEvent,
  userName: string,
  appBaseUrl: string | undefined,
): FeedItem {
  const [Icon, hue] = TIMELINE_ICON[event.kind];
  const href = event.workspaceId
    ? `/workspaces/${event.workspaceId}`
    : event.slug
      ? shareUrl(appBaseUrl, event.slug)
      : null;
  return {
    key: event.key,
    icon: <Icon size={15} aria-hidden />,
    hue,
    at: event.at,
    text: (
      <>
        <span className="text-fg-strong font-medium">
          {event.actor ?? userName}
        </span>{" "}
        {event.text}
        {event.subject && (
          <>
            {" "}
            {href ? (
              <NextLink
                href={href}
                className="text-fg-strong hover:underline"
                target={event.workspaceId ? undefined : "_blank"}
              >
                {event.subject}
              </NextLink>
            ) : (
              <span className="text-fg-strong">{event.subject}</span>
            )}
          </>
        )}
      </>
    ),
  };
}

const STATE_COLOR = {
  ready: "success",
  pending: "warning",
  failed: "danger",
} as const;

const CLIENT_LABEL: Record<string, string> = {
  extension: "Extension",
  desktop: "Desktop",
  agent: "Agent",
};
const CAPTURE_LABEL: Record<string, string> = {
  tab: "tab",
  window: "window",
  screen: "screen",
};
// Mirrors the preset labels in packages/engine/src/quality.ts.
const QUALITY_LABEL: Record<string, string> = {
  saver: "Data saver",
  low: "Low",
  balanced: "Balanced",
  high: "High",
  max: "Maximum",
};

// "Extension · tab", or whichever half the client reported; "—" for rows
// from clients that predate the fields.
function captureLabel(
  client: string | null,
  captureSource: string | null,
): string {
  const parts = [
    client ? (CLIENT_LABEL[client] ?? client) : null,
    captureSource ? (CAPTURE_LABEL[captureSource] ?? captureSource) : null,
  ].filter((p): p is string => p !== null);
  return parts.length ? parts.join(" · ") : "—";
}

function CaptureCell({ captureJson }: { captureJson: string | null }) {
  const capture = summarizeCapture(captureJson);
  if (!capture) return "—";
  const warningCount = capture.warnings.length;
  return (
    <span title={warningCount > 0 ? capture.warnings.join("\n") : undefined}>
      {capture.mic}
      <br />
      {capture.camera}
      {warningCount > 0 && (
        <>
          <br />
          {warningCount} {warningCount === 1 ? "warning" : "warnings"}
        </>
      )}
    </span>
  );
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const operator = await requirePermission("users.read");
  const { id } = await params;
  const env = await getAdminEnv();
  if (!env?.DB) notFound();

  const [user, activity, timeline, subscriptions, workspaces, audit, limits] =
    await Promise.all([
      getAdminUser(env.DB, id),
      getUserActivity(env.DB, id),
      getUserTimeline(env.DB, id),
      listUserSubscriptions(env.DB, id),
      listUserWorkspaces(env.DB, id),
      listAuditForTarget(env.DB, "user", id),
      getLimitOverride(env.DB, "user", id),
    ]);
  if (!user) notFound();
  const canWrite = can(operator.role, "users.write");
  const now = Date.now();
  const displayName = user.name || user.email;

  const timelineFeed =
    timeline.length === 0 ? (
      <Empty title="Nothing yet" />
    ) : (
      <div className="max-w-2xl">
        <Feed
          items={timeline.map((e) =>
            timelineItem(e, displayName, env.APP_BASE_URL),
          )}
          formatTime={(ms) => formatRelative(ms, now)}
        />
      </div>
    );
  const ownedTeams = workspaces.filter(
    (w) => w.kind === "team" && w.owner.id === user.id,
  ).length;

  const recentTable =
    activity.recent.length === 0 ? (
      <Empty title="No recordings yet" />
    ) : (
      <DataTable
        label="Recent recordings"
        columns={[
          "Recording",
          "State",
          "Visibility",
          "Source",
          "Devices",
          "Quality",
          "Length",
          "Size",
          "Views",
          "Created",
        ]}
      >
        {activity.recent.map((r) => (
          <TableRow key={r.slug}>
            <TableCell>
              <RecordingCell
                title={r.title}
                slug={r.slug}
                visibility={r.visibility}
                state={r.state}
                appBaseUrl={env.APP_BASE_URL}
                detail={r.workspaceName ? ` · ${r.workspaceName}` : null}
              />
            </TableCell>
            <TableCell>
              <Tone
                color={
                  STATE_COLOR[r.state as keyof typeof STATE_COLOR] ?? "default"
                }
              >
                {r.state}
              </Tone>
            </TableCell>
            <TableCell className="text-fg-muted capitalize">
              {r.visibility}
            </TableCell>
            <TableCell className="text-fg-muted whitespace-nowrap">
              {captureLabel(r.client, r.captureSource)}
            </TableCell>
            <TableCell className="text-fg-muted text-xs whitespace-nowrap">
              <CaptureCell captureJson={r.captureJson} />
            </TableCell>
            <TableCell className="text-fg-muted whitespace-nowrap">
              {r.quality ? (QUALITY_LABEL[r.quality] ?? r.quality) : "—"}
            </TableCell>
            <TableCell className="tabular-nums whitespace-nowrap">
              {r.durationMs ? formatDuration(r.durationMs) : "—"}
            </TableCell>
            <TableCell className="tabular-nums whitespace-nowrap">
              {formatBytes(r.sizeBytes)}
            </TableCell>
            <TableCell className="tabular-nums">{r.viewCount}</TableCell>
            <TableCell className="text-fg-muted whitespace-nowrap">
              {formatRelative(r.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    );

  const workspaceTable = (
    <DataTable
      label="Workspaces"
      columns={[
        "Workspace",
        "Role",
        "Owner",
        "Members",
        "Recordings",
        "Stored",
      ]}
    >
      {workspaces.map((w) => (
        <TableRow key={w.id}>
          <TableCell>
            <div className="flex items-center gap-3">
              <Monogram name={w.name} />
              <div className="min-w-0">
                <NextLink
                  href={`/workspaces/${w.id}`}
                  className="text-fg-strong truncate font-medium hover:underline"
                >
                  {w.name}
                </NextLink>
                <div className="text-fg-subtle text-xs capitalize">
                  {w.kind}
                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Tone color={w.role === "owner" ? "accent" : "default"}>
              {w.role ?? "—"}
            </Tone>
          </TableCell>
          <TableCell className="text-fg-muted">
            {w.owner.id === user.id ? (
              "This user"
            ) : (
              <NextLink
                href={`/users/${w.owner.id}`}
                className="hover:underline"
              >
                {w.owner.email}
              </NextLink>
            )}
          </TableCell>
          <TableCell className="tabular-nums whitespace-nowrap">
            {w.memberCount}
            {w.pendingInvites ? (
              <span className="text-fg-subtle">
                {" "}
                +{w.pendingInvites} invited
              </span>
            ) : null}
          </TableCell>
          <TableCell className="tabular-nums">{w.recordingCount}</TableCell>
          <TableCell className="tabular-nums whitespace-nowrap">
            {formatBytes(w.storageBytes)}
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  );

  const subscriptionTable =
    subscriptions.length === 0 ? (
      <Empty title="No workspace this user owns has subscribed" />
    ) : (
      <DataTable
        label="Subscriptions"
        columns={[
          "Workspace",
          "Seats",
          "Status",
          "Billing",
          "Period ends",
          "Started",
          "Customer email",
        ]}
      >
        {subscriptions.map((s) => (
          <TableRow key={s.id}>
            <TableCell>
              <NextLink
                href={`/workspaces/${s.workspaceId}`}
                className="text-fg-strong font-medium hover:underline"
              >
                {s.workspaceName}
              </NextLink>
            </TableCell>
            <TableCell className="tabular-nums">{s.quantity}</TableCell>
            <TableCell>
              <Tone
                color={
                  s.status === "past_due"
                    ? "warning"
                    : s.isActive
                      ? "accent"
                      : "default"
                }
              >
                {s.status.replace("_", " ")}
                {s.isActive ? "" : " · inactive"}
              </Tone>
            </TableCell>
            <TableCell className="capitalize">{s.cycle}</TableCell>
            <TableCell className="tabular-nums whitespace-nowrap">
              {s.currentPeriodEnd
                ? formatDate(s.currentPeriodEnd * 1000).slice(0, 10)
                : "—"}
            </TableCell>
            <TableCell className="tabular-nums whitespace-nowrap">
              {formatDate(s.createdAt * 1000).slice(0, 10)}
            </TableCell>
            <TableCell className="text-fg-muted">{s.customerEmail}</TableCell>
          </TableRow>
        ))}
      </DataTable>
    );

  const planPanel = (
    <div className="grid gap-5 lg:grid-cols-2">
      <FormCard
        title="Plan"
        description="A person is on a paid plan while they hold a seat in a paid workspace. Plans belong to workspaces, so change them from the workspace or the billing provider."
      >
        <PlanChip plan={user.plan} />
      </FormCard>
      <FormCard
        title="Access"
        description={`${user.activeSessions} browser ${user.activeSessions === 1 ? "session" : "sessions"} and ${user.activeDevices} connected ${user.activeDevices === 1 ? "device" : "devices"} (desktop app and extension). Signing out ends all of them; the user can sign straight back in.`}
      >
        {canWrite ? (
          <SignOutEverywhere
            userId={user.id}
            sessions={user.activeSessions}
            devices={user.activeDevices}
          />
        ) : (
          <p className="text-fg-muted text-sm">
            Read-only: your role cannot sign users out.
          </p>
        )}
      </FormCard>
      <LimitsCard
        appliesTo="this person can record in every free workspace they belong to"
        action={setUserLimitsAction}
        id={user.id}
        override={limits}
        canWrite={canWrite}
      />
    </div>
  );

  const historyTable =
    audit.length === 0 ? (
      <Empty title="No admin changes yet" />
    ) : (
      <DataTable
        label="Admin history"
        columns={["Action", "Detail", "By", "When"]}
      >
        {audit.map((a) => (
          <TableRow key={a.id}>
            <TableCell>
              <Tone color="default">{a.action}</Tone>
            </TableCell>
            <TableCell className="text-fg-muted max-w-sm truncate">
              {a.detail ?? "—"}
            </TableCell>
            <TableCell className="text-fg-muted">{a.actor}</TableCell>
            <TableCell className="text-fg-muted whitespace-nowrap">
              {formatRelative(a.createdAt)}
            </TableCell>
          </TableRow>
        ))}
      </DataTable>
    );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={user.name || user.email}
        back={{ href: "/users", label: "Users" }}
        description={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {user.name && <span>{user.email}</span>}
            <span>Joined {formatRelative(user.createdAt)}</span>
            <span>Active {formatRelative(user.lastActiveAt)}</span>
          </span>
        }
        actions={
          <>
            <PlanChip plan={user.plan} />
            <Tone color={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? "Verified" : "Unverified"}
            </Tone>
            {user.providers.map((p) => (
              <Tone key={p} color="default">
                {p === "credential" ? "password" : p}
              </Tone>
            ))}
          </>
        }
      >
        <Monogram name={user.name || user.email} size="lg" />
      </PageHeader>

      <StatGrid columns={4}>
        <Stat
          label="Recordings"
          value={user.recordingCount.toLocaleString()}
          hint={`${activity.recordings30d} in 30 days · ${formatDuration(activity.totalDurationMs)} total`}
        />
        <Stat
          label="Screenshots"
          value={user.screenshotCount.toLocaleString()}
          hint={`${activity.screenshots30d} in 30 days`}
        />
        <Stat
          label="Views received"
          value={activity.totalViews.toLocaleString()}
          hint="Recordings and screenshots"
        />
        <Stat
          label="Stored"
          value={formatBytes(user.storageBytes)}
          hint={`In workspaces this user owns · ${ownedTeams} team ${ownedTeams === 1 ? "workspace" : "workspaces"} owned`}
        />
      </StatGrid>

      <PanelTabs
        label="User details"
        items={[
          { id: "activity", label: "Activity", content: timelineFeed },
          { id: "recordings", label: "Recordings", content: recentTable },
          {
            id: "workspaces",
            label: `Workspaces · ${workspaces.length}`,
            content: workspaceTable,
          },
          { id: "plan", label: "Plan & access", content: planPanel },
          {
            id: "subscriptions",
            label: "Subscriptions",
            content: subscriptionTable,
          },
          { id: "history", label: "History", content: historyTable },
        ]}
      />
    </div>
  );
}
