import type { ReactNode } from "react";
import { Button, Chip } from "@heroui/react";
import {
  Box,
  ChevronRight,
  Layers,
  Plug,
  Route as RouteIcon,
  Scale,
  User,
  Zap,
} from "lucide-react";
import {
  DOMAIN_BY_ID,
  KIND_LABEL,
  STATUS_LABEL,
  resolveRef,
  type DomainId,
  type Effect,
  type ItemKind,
  type ItemRef,
  type Status,
} from "../model";
import { hrefFor } from "../lib/hash-route";

export const KIND_ICON: Record<ItemKind, typeof Box> = {
  domain: Layers,
  actor: User,
  entity: Box,
  interface: Plug,
  capability: Zap,
  rule: Scale,
  journey: RouteIcon,
};

export const KIND_TONE: Record<ItemKind, string> = {
  domain: "text-pink-600",
  actor: "text-blue-600",
  entity: "text-blue-600",
  interface: "text-orange-600",
  capability: "text-green-600",
  rule: "text-violet-600",
  journey: "text-teal-600",
};

const STATUS_COLOR: Record<Status, "success" | "accent" | "warning"> = {
  live: "success",
  draft: "accent",
  planned: "warning",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <Chip size="sm" variant="soft" color={STATUS_COLOR[status]}>
      {STATUS_LABEL[status]}
    </Chip>
  );
}

const EFFECT_COLOR: Record<
  Effect,
  "success" | "warning" | "danger" | "default"
> = {
  creates: "success",
  changes: "warning",
  removes: "danger",
  reads: "default",
};

export function EffectPill({ effect }: { effect: Effect }) {
  return (
    <Chip size="sm" variant="soft" color={EFFECT_COLOR[effect]}>
      {effect}
    </Chip>
  );
}

export function KindIcon({
  kind,
  size = 16,
}: {
  kind: ItemKind;
  size?: number;
}) {
  const Icon = KIND_ICON[kind];
  return <Icon size={size} className={KIND_TONE[kind]} />;
}

export function DomainDot({ domain }: { domain: DomainId }) {
  const d = DOMAIN_BY_ID.get(domain);
  return (
    <span
      className="inline-block size-2 shrink-0 rounded-full"
      style={{ background: `oklch(0.65 0.15 ${d?.hue ?? 0})` }}
      title={d?.name}
    />
  );
}

// A link to another item in the model, by kind and id.
export function RefLink({ kind, id }: ItemRef) {
  const item = resolveRef({ kind, id });
  return (
    <a
      href={hrefFor({ kind, id })}
      className="bg-default-soft text-foreground hover:bg-default-hover inline-flex max-w-full items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium transition-colors"
    >
      <KindIcon kind={kind} size={12} />
      <span className="truncate">{item?.name ?? id}</span>
    </a>
  );
}

export function RefList({ kind, ids }: { kind: ItemKind; ids: string[] }) {
  if (ids.length === 0) return <span className="text-muted text-xs">none</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {ids.map((id) => (
        <RefLink key={id} kind={kind} id={id} />
      ))}
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="text-muted mb-1 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}

export function Group({
  title,
  count,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="border-border bg-surface group rounded-xl border"
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 select-none">
        {icon}
        <span className="font-semibold">{title}</span>
        <span className="text-muted ml-auto text-xs tabular-nums">{count}</span>
        <ChevronRight
          size={14}
          className="text-muted transition-transform group-open:rotate-90"
        />
      </summary>
      <div className="border-border border-t p-3">{children}</div>
    </details>
  );
}

export function Row({
  kind,
  name,
  status,
  description,
  sub,
  meta,
  href,
  isActive,
}: {
  kind: ItemKind;
  name: string;
  status?: Status;
  description: string;
  sub?: ReactNode;
  meta?: { value: number; label: string }[];
  href: string;
  isActive: boolean;
}) {
  return (
    <a
      href={href}
      className={
        "border-border hover:bg-background-secondary flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors " +
        (isActive ? "bg-accent-soft border-accent/40" : "bg-background")
      }
    >
      <span className="mt-0.5">
        <KindIcon kind={kind} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">{name}</span>
          {status ? <StatusPill status={status} /> : null}
        </span>
        <span className="text-muted mt-0.5 line-clamp-2 block text-sm">
          {description}
        </span>
        {sub ? (
          <span className="text-muted mt-1 block text-xs">{sub}</span>
        ) : null}
      </span>
      {meta ? (
        <span className="hidden shrink-0 items-center gap-4 text-xs lg:flex">
          {meta.map((m) => (
            <span key={m.label} className="text-muted">
              <b className="text-foreground font-semibold tabular-nums">
                {m.value}
              </b>{" "}
              {m.label}
            </span>
          ))}
        </span>
      ) : null}
      <ChevronRight size={14} className="text-muted mt-1 shrink-0" />
    </a>
  );
}

export function FilterButtons<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (next: T | null) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted mr-1 text-[11px] font-semibold tracking-wide uppercase">
        {label}
      </span>
      <Button
        size="sm"
        variant={value === null ? "primary" : "secondary"}
        onPress={() => onChange(null)}
      >
        All
      </Button>
      {options.map((o) => (
        <Button
          key={o.id}
          size="sm"
          variant={value === o.id ? "primary" : "secondary"}
          onPress={() => onChange(value === o.id ? null : o.id)}
        >
          {o.label}
        </Button>
      ))}
    </div>
  );
}

export function PageHeader({
  kind,
  title,
  count,
  children,
}: {
  kind: ItemKind | "overview";
  title: string;
  count?: number;
  children?: ReactNode;
}) {
  return (
    <div className="border-border bg-surface/80 sticky top-0 z-10 border-b px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-2">
        {kind === "overview" ? null : <KindIcon kind={kind} size={18} />}
        <h1 className="text-lg font-semibold">{title}</h1>
        {typeof count === "number" ? (
          <span className="text-muted text-sm tabular-nums">{count}</span>
        ) : null}
        <span className="text-muted ml-1 text-xs">
          {kind === "overview" ? "" : KIND_LABEL[kind]}
        </span>
      </div>
      {children ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
