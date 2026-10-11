import type { ReactNode } from "react";
import NextLink from "next/link";
import {
  Alert,
  Card,
  Chip,
  ProgressBar,
  Table,
  Typography,
} from "@heroui/react";
import type { AdminPlanSummary } from "@captureflow/admin";
import { cn } from "@captureflow/ui/cn";

export function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 4);
  const n = bytes / 1024 ** i;
  const rounded = n >= 100 || i === 0 ? Math.round(n) : +n.toFixed(1);
  return `${rounded} ${units[i]}`;
}

export function formatDate(ms: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
}

export function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function Stat({
  label,
  value,
  hint,
  icon,
  children,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Card className="border-line border">
      <Card.Content className="flex flex-col gap-1 p-4">
        <div className="text-fg-muted flex items-center justify-between gap-2 text-xs">
          <span>{label}</span>
          {icon && <span className="text-fg-subtle">{icon}</span>}
        </div>
        <div className="text-fg-strong text-2xl font-semibold tracking-tight tabular-nums">
          {value}
        </div>
        {hint && <div className="text-fg-subtle text-xs">{hint}</div>}
        {children}
      </Card.Content>
    </Card>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className,
}: {
  title?: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-line bg-panel flex min-w-0 flex-col gap-4 rounded-xl border p-5",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4">
          {title && (
            <SectionHeading title={title}>{description}</SectionHeading>
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

// Start date of each bucket from weeklyBuckets, in UTC so server and browser
// agree; the last one is the current week.
export function weekLabels(weeks: number, now = Date.now()): string[] {
  return Array.from({ length: weeks }, (_, i) =>
    i === weeks - 1
      ? "Now"
      : new Date(now - (weeks - i) * WEEK_MS).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        }),
  );
}

export function Initials({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  const letters =
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?";
  return (
    <span
      aria-hidden
      className={cn(
        "bg-tint-strong text-fg grid shrink-0 place-items-center rounded-full font-semibold",
        size === "lg" ? "size-14 text-lg" : "size-8 text-xs",
      )}
    >
      {letters}
    </span>
  );
}

export function SectionHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <Typography.Heading level={2} className="mt-0 mb-0 text-sm font-semibold">
        {title}
      </Typography.Heading>
      {children && (
        <Typography.Paragraph className="text-fg-muted mt-1 mb-0 text-sm">
          {children}
        </Typography.Paragraph>
      )}
    </div>
  );
}

export function PageHeading({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <Typography.Heading level={1} className="mt-0 mb-0 text-xl font-semibold">
        {title}
      </Typography.Heading>
      {children && (
        <Typography.Paragraph className="text-fg-muted mt-1 mb-0 text-sm">
          {children}
        </Typography.Paragraph>
      )}
    </div>
  );
}

export function DataTable({
  label,
  columns,
  children,
}: {
  label: string;
  columns: string[];
  children: ReactNode;
}) {
  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={label} className="w-full">
          <Table.Header>
            {columns.map((c, i) => (
              // A blank trailing column header carries the row actions; the
              // first column is the row header for assistive tech.
              <Table.Column key={c || `actions-${i}`} isRowHeader={i === 0}>
                {c}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>{children}</Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error";
  children: ReactNode;
}) {
  return (
    <Alert status={tone === "error" ? "danger" : "accent"}>
      <Alert.Content>
        <Alert.Description>{children}</Alert.Description>
      </Alert.Content>
    </Alert>
  );
}

export function formatRelative(ms: number | null, now = Date.now()): string {
  if (!ms) return "Never";
  const minutes = Math.round((now - ms) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ago`;
  return formatDate(ms).slice(0, 10);
}

const PLAN_COLOR = {
  subscription: "accent",
  granted: "success",
  free: "default",
} as const;

// A lapsed subscription stays visible beside whatever plan applies now, so
// "never paid" and "card declined" read differently.
export function PlanChip({ plan }: { plan: AdminPlanSummary }) {
  const status = plan.subscriptionStatus;
  const note =
    status && status !== "active"
      ? ` · ${plan.source === "subscription" ? "" : "sub "}${status.replace("_", " ")}`
      : "";
  const name =
    plan.source === "free"
      ? "Free"
      : `${plan.source === "granted" ? "Granted" : "Pro"} · ${plan.label}`;
  return (
    <Chip
      size="sm"
      color={status === "past_due" ? "warning" : PLAN_COLOR[plan.source]}
    >
      {name}
      {note}
    </Chip>
  );
}

export function Pager({
  page,
  total,
  pageSize,
  hrefFor,
}: {
  page: number;
  total: number;
  pageSize: number;
  hrefFor: (page: number) => string;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const link = (target: number, label: string) =>
    target < 1 || target > pages ? (
      <span className="text-fg-subtle">{label}</span>
    ) : (
      <NextLink href={hrefFor(target)} className="hover:text-fg">
        {label}
      </NextLink>
    );
  return (
    <div className="text-fg-muted flex items-center justify-between text-sm">
      <span className="tabular-nums">
        {total.toLocaleString()} total · page {Math.min(page, pages)} of {pages}
      </span>
      <div className="flex gap-4">
        {link(page - 1, "Previous")}
        {link(page + 1, "Next")}
      </div>
    </div>
  );
}

export function PersonCell({
  id,
  name,
  email,
  badge,
}: {
  id: string;
  name: string;
  email: string;
  badge?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <Initials name={name || email} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <NextLink
            href={`/users/${id}`}
            className="truncate font-medium hover:underline"
          >
            {name || email}
          </NextLink>
          {badge}
        </div>
        <div className="text-fg-subtle truncate text-xs">{email}</div>
      </div>
    </div>
  );
}

export function pageParam(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function queryString(
  params: Record<string, string | number | undefined>,
): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "" && v !== "all" && v !== 1) {
      search.set(k, String(v));
    }
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

export function StorageMeter({ used, limit }: { used: number; limit: number }) {
  const ratio = limit > 0 ? Math.min(1, used / limit) : 1;
  return (
    <div>
      <div className="text-fg-muted flex justify-between text-sm tabular-nums">
        <span>
          {formatBytes(used)} of {formatBytes(limit)}
        </span>
        <span>{Math.round(ratio * 100)}%</span>
      </div>
      <ProgressBar
        value={Math.round(ratio * 100)}
        color={ratio >= 1 ? "danger" : ratio >= 0.8 ? "warning" : "accent"}
        aria-label="Storage used"
        className="mt-2"
      >
        <ProgressBar.Track className="bg-tint-strong h-1.5 rounded-full">
          <ProgressBar.Fill className="rounded-full" />
        </ProgressBar.Track>
      </ProgressBar>
    </div>
  );
}
