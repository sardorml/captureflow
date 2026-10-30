import type { ReactNode } from "react";
import NextLink from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import type { AdminPlanSummary } from "@captureflow/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty as EmptyRoot,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

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
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground motion-reduce:transition-none"
        >
          <ArrowLeft size={14} aria-hidden />
          {back.label}
        </NextLink>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {children}
          <div className="min-w-0">
            <h1 className="truncate text-2xl leading-tight font-semibold tracking-tight">
              {title}
            </h1>
            {description && (
              <div className="mt-1 text-sm text-muted-foreground">
                {description}
              </div>
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
          <h2 className="text-base font-semibold">{title}</h2>
          {description && (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
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
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
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
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
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
    <Card className="py-0">
      <div
        className={cn(
          "grid grid-cols-2 divide-x [&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-t-0",
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

export function formatClock(ms: number | null): string {
  if (!ms) return "—";
  const seconds = Math.round(ms / 1000);
  const m = Math.floor(seconds / 60);
  return `${m}:${String(seconds % 60).padStart(2, "0")}`;
}

export function shareUrl(appBaseUrl: string | undefined, slug: string) {
  return appBaseUrl ? `${appBaseUrl.replace(/\/+$/, "")}/r/${slug}` : null;
}

// Only public recordings get a link: the share page asks anyone else to sign
// in, and a failed upload has nothing to play.
export function RecordingCell({
  title,
  slug,
  visibility,
  state,
  appBaseUrl,
  detail,
}: {
  title: string | null;
  slug: string;
  visibility: string;
  state: string;
  appBaseUrl: string | undefined;
  detail?: ReactNode;
}) {
  const href =
    visibility === "public" && state !== "failed"
      ? shareUrl(appBaseUrl, slug)
      : null;
  const name = title || "Untitled recording";
  return (
    <div className="min-w-0">
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex max-w-60 items-center gap-1.5 font-medium hover:underline"
        >
          <span className="truncate">{name}</span>
          <ExternalLink
            size={13}
            className="shrink-0 text-muted-foreground group-hover:text-foreground"
            aria-hidden
          />
        </a>
      ) : (
        <div className="max-w-60 truncate font-medium">{name}</div>
      )}
      <div className="truncate text-xs text-muted-foreground">
        <span className="font-mono">{slug}</span>
        {detail}
      </div>
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
    <div className="overflow-hidden rounded-lg border">
      <Table aria-label={label}>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            {columns.map((c, i) => (
              <TableHead key={c || `actions-${i}`} className="px-4">
                {c}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="[&_td]:px-4 [&_td]:py-3">{children}</TableBody>
      </Table>
    </div>
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
    <EmptyRoot className="border border-dashed">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        {children && <EmptyDescription>{children}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent>{action}</EmptyContent>}
    </EmptyRoot>
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
    <Alert variant={tone === "error" ? "destructive" : "default"}>
      <AlertDescription>{children}</AlertDescription>
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
      className={cn(
        "shrink-0 rounded-lg after:rounded-lg",
        size === "lg" ? "size-14" : "size-9",
      )}
    >
      <AvatarFallback
        className={cn(
          "rounded-lg font-semibold",
          size === "lg" ? "text-lg" : "text-xs",
        )}
      >
        {initials(name)}
      </AvatarFallback>
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
            className="truncate font-medium hover:underline"
          >
            {name || email}
          </NextLink>
          {badge}
        </div>
        {name && (
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        )}
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
    <Tone
      color={
        status === "past_due"
          ? "warning"
          : plan.tier === "team"
            ? "accent"
            : "default"
      }
    >
      {plan.tier === "team" ? "Paid" : "Free"}
      {note}
    </Tone>
  );
}

const TONES = {
  default: "bg-secondary text-secondary-foreground",
  accent: "bg-primary/15 text-accent-strong",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/15 text-destructive",
} as const;

export function Tone({
  color,
  children,
}: {
  color: keyof typeof TONES;
  children: ReactNode;
}) {
  return (
    <Badge className={cn("border-transparent capitalize", TONES[color])}>
      {children}
    </Badge>
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
      <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
        <span>
          {formatBytes(used)} of {formatBytes(limit)}
        </span>
        <span>{Math.round(ratio * 100)}%</span>
      </div>
      <Progress
        value={Math.round(ratio * 100)}
        aria-label="Storage used"
        className={cn(
          "mt-2 h-1.5",
          ratio >= 1
            ? "*:data-[slot=progress-indicator]:bg-destructive"
            : ratio >= 0.8 && "*:data-[slot=progress-indicator]:bg-amber-500",
        )}
      />
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
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center gap-6 py-12">
      <div className="flex items-center gap-2.5 self-center">
        <Avatar className="size-8 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            C
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold">CaptureFlow admin</span>
      </div>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        {children && (
          <CardContent className="flex flex-col gap-4">{children}</CardContent>
        )}
      </Card>
    </div>
  );
}
