import type { ReactNode } from "react";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Alert,
  Avatar,
  Card,
  Chip,
  EmptyState,
  ProgressBar,
  Table,
} from "@heroui/react";
import type { AdminPlanSummary } from "@captureflow/admin";
import { SEAT_PLAN } from "@captureflow/admin";
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

export function formatRelative(ms: number | null, now = Date.now()): string {
  if (!ms) return "Never";
  const minutes = Math.round((now - ms) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 60) return `${days}d ago`;
  return formatDate(ms).slice(0, 10);
}

export function PageHeader({
  title,
  description,
  actions,
  back,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
  children?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {back && (
        <NextLink
          href={back.href}
          className="text-fg-muted hover:text-fg flex w-fit items-center gap-1.5 text-sm transition-colors motion-reduce:transition-none"
        >
          <ArrowLeft size={14} aria-hidden />
          {back.label}
        </NextLink>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {children}
          <div className="min-w-0">
            <h1 className="text-fg-strong truncate text-[28px] leading-tight font-semibold tracking-tight">
              {title}
            </h1>
            {description && (
              <div className="text-fg-muted mt-1 text-sm">{description}</div>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

export function Section({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-fg-strong text-base font-semibold">{title}</h2>
          {description && (
            <p className="text-fg-muted mt-0.5 text-sm">{description}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="border-line bg-canvas border">
      <Card.Header className="flex flex-col gap-1">
        <Card.Title className="text-fg-strong text-[15px] font-semibold">
          {title}
        </Card.Title>
        {description && (
          <Card.Description className="text-fg-muted text-sm">
            {description}
          </Card.Description>
        )}
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">{children}</Card.Content>
    </Card>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 px-5 py-4">
      <span className="text-fg-muted text-sm">{label}</span>
      <span className="text-fg-strong text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      {hint && <span className="text-fg-subtle text-xs">{hint}</span>}
    </div>
  );
}

export function StatGrid({
  children,
  columns = 4,
}: {
  children: ReactNode;
  columns?: 3 | 4 | 6;
}) {
  return (
    <Card className="border-line bg-canvas border p-0">
      <div
        className={cn(
          "divide-line grid grid-cols-2 divide-x [&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-t-0",
          columns === 3 && "sm:grid-cols-3",
          columns === 4 && "sm:grid-cols-4",
          columns === 6 && "sm:grid-cols-3 xl:grid-cols-6",
        )}
      >
        {children}
      </div>
    </Card>
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
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label={label} className="w-full">
          <Table.Header className="[&_th]:border-line [&_th]:bg-canvas-2 [&_th]:text-fg-muted [&_th]:border-y [&_th]:after:hidden [&_th:first-child]:border-l [&_th:last-child]:border-r">
            {columns.map((c, i) => (
              <Table.Column key={c || `actions-${i}`} isRowHeader={i === 0}>
                {c}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body className="[&_td]:border-line [&_td]:py-3.5">
            {children}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}

export function Empty({
  title,
  children,
  action,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <EmptyState className="border-line flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-14 text-center">
      <p className="text-fg-strong text-sm font-medium">{title}</p>
      {children && <p className="text-fg-muted max-w-sm text-sm">{children}</p>}
      {action && <div className="mt-2">{action}</div>}
    </EmptyState>
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

function initials(name: string): string {
  return (
    name
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join("") || "?"
  );
}

export function Monogram({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "lg";
}) {
  return (
    <Avatar
      size={size === "lg" ? "lg" : "sm"}
      className={cn(
        "border-line bg-canvas-2 shrink-0 rounded-lg border",
        size === "lg" ? "size-14" : "size-9",
      )}
    >
      <Avatar.Fallback
        className={cn(
          "text-fg font-semibold",
          size === "lg" ? "text-lg" : "text-xs",
        )}
      >
        {initials(name)}
      </Avatar.Fallback>
    </Avatar>
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
    <div className="flex min-w-0 items-center gap-3">
      <Monogram name={name || email} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <NextLink
            href={`/users/${id}`}
            className="text-fg-strong truncate font-medium hover:underline"
          >
            {name || email}
          </NextLink>
          {badge}
        </div>
        {name && <div className="text-fg-subtle truncate text-xs">{email}</div>}
      </div>
    </div>
  );
}

// A lapsed subscription stays visible beside whatever plan applies now, so
// "never paid" and "card declined" read differently.
export function PlanChip({ plan }: { plan: AdminPlanSummary }) {
  const status = plan.subscriptionStatus;
  const note =
    status && status !== "active" ? ` · ${status.replace("_", " ")}` : "";
  return (
    <Chip
      size="sm"
      variant="soft"
      color={
        status === "past_due"
          ? "warning"
          : plan.tier === "team"
            ? "accent"
            : "default"
      }
    >
      {plan.tier === "team" ? SEAT_PLAN.name : "Free"}
      {note}
    </Chip>
  );
}

export function Tone({
  color,
  children,
}: {
  color: "default" | "accent" | "success" | "warning" | "danger";
  children: ReactNode;
}) {
  return (
    <Chip size="sm" variant="soft" color={color} className="capitalize">
      {children}
    </Chip>
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

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 py-12">
      <div className="flex items-center gap-2.5">
        <Avatar size="sm" color="accent" className="size-8 rounded-lg">
          <Avatar.Fallback className="text-sm font-semibold">C</Avatar.Fallback>
        </Avatar>
        <span className="text-fg-strong text-[15px] font-semibold">
          CaptureFlow admin
        </span>
      </div>
      <Card className="border-line bg-canvas border">
        <Card.Header className="flex flex-col gap-1">
          <Card.Title className="text-fg-strong text-xl font-semibold">
            {title}
          </Card.Title>
          {description && (
            <Card.Description className="text-fg-muted text-sm">
              {description}
            </Card.Description>
          )}
        </Card.Header>
        {children && (
          <Card.Content className="flex flex-col gap-4">
            {children}
          </Card.Content>
        )}
      </Card>
    </div>
  );
}
