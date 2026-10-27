import { useState } from "react";
import { Card } from "@heroui/react";
import { ChevronRight } from "lucide-react";
import {
  CAPABILITY_BY_ID,
  MODEL,
  STATUS_LABEL,
  type DomainId,
  type Rule,
  type Status,
} from "../model";
import { hrefFor } from "../lib/hash-route";
import {
  FilterButtons,
  Group,
  KindIcon,
  PageHeader,
  StatusPill,
} from "../components/primitives";

export function affectedEntities(rule: Rule): string[] {
  const ids = new Set<string>();
  for (const capId of rule.attachedTo) {
    const cap = CAPABILITY_BY_ID.get(capId);
    for (const e of cap?.effects ?? []) ids.add(e.entity);
  }
  return [...ids];
}

export function RulesView({ selectedId }: { selectedId: string | null }) {
  const [domain, setDomain] = useState<DomainId | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [attached, setAttached] = useState<string | null>(null);

  const shown = MODEL.rules.filter(
    (r) =>
      (domain === null || r.domains.includes(domain)) &&
      (status === null || r.status === status) &&
      (attached === null || r.attachedTo.includes(attached)),
  );
  const multi = shown.filter((r) => r.domains.length > 1).length;

  return (
    <div className="min-h-full">
      <PageHeader kind="rule" title="Business rules" count={MODEL.rules.length}>
        <FilterButtons
          label="Domain"
          options={MODEL.domains.map((d) => ({ id: d.id, label: d.name }))}
          value={domain}
          onChange={setDomain}
        />
        <FilterButtons
          label="Status"
          options={(Object.keys(STATUS_LABEL) as Status[]).map((s) => ({
            id: s,
            label: STATUS_LABEL[s],
          }))}
          value={status}
          onChange={setStatus}
        />
        <label className="flex items-center gap-2 text-xs">
          <span className="text-muted font-semibold tracking-wide uppercase">
            Attached to
          </span>
          <select
            className="border-border bg-background h-8 rounded-md border px-2 text-sm"
            value={attached ?? ""}
            onChange={(e) => setAttached(e.target.value || null)}
          >
            <option value="">Any capability</option>
            {MODEL.capabilities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>
      <div className="flex flex-col gap-4 px-6 py-5">
        {multi > 0 ? (
          <p className="text-muted text-xs">
            {multi} {multi === 1 ? "rule relates" : "rules relate"} to more than
            one domain and {multi === 1 ? "appears" : "appear"} under each.
          </p>
        ) : null}
        {MODEL.domains.map((d) => {
          const rows = shown.filter((r) => r.domains.includes(d.id));
          if (rows.length === 0) return null;
          return (
            <Group
              key={d.id}
              title={d.name}
              count={rows.length}
              icon={
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: `oklch(0.65 0.15 ${d.hue})` }}
                />
              }
            >
              <div className="grid gap-3 xl:grid-cols-2">
                {rows.map((r) => (
                  <RuleCard
                    key={r.id}
                    rule={r}
                    isActive={selectedId === r.id}
                  />
                ))}
              </div>
            </Group>
          );
        })}
      </div>
    </div>
  );
}

function RuleCard({ rule, isActive }: { rule: Rule; isActive: boolean }) {
  const affected = affectedEntities(rule);
  return (
    <a href={hrefFor({ kind: "rule", id: rule.id })} className="block">
      <Card
        className={
          "hover:bg-background-secondary h-full p-4 transition-colors " +
          (isActive ? "bg-accent-soft" : "")
        }
      >
        <div className="flex items-start gap-2">
          <span className="mt-0.5">
            <KindIcon kind="rule" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{rule.title}</span>
              <StatusPill status={rule.status} />
            </div>
            <p className="text-muted mt-1 line-clamp-2 text-sm">{rule.text}</p>
            <p className="text-muted mt-2 text-xs">
              Attached to{" "}
              {rule.attachedTo
                .slice(0, 2)
                .map((c) => CAPABILITY_BY_ID.get(c)?.name)
                .join(" · ")}
              {rule.attachedTo.length > 2
                ? ` +${rule.attachedTo.length - 2}`
                : ""}
            </p>
            <p className="text-muted mt-2 text-xs">
              <b className="text-foreground tabular-nums">
                {rule.attachedTo.length}
              </b>{" "}
              bindings ·{" "}
              <b className="text-foreground tabular-nums">{affected.length}</b>{" "}
              affected ·{" "}
              <b className="text-foreground tabular-nums">
                {rule.domains.length}
              </b>{" "}
              {rule.domains.length === 1 ? "domain" : "domains"}
            </p>
          </div>
          <ChevronRight size={14} className="text-muted mt-1 shrink-0" />
        </div>
      </Card>
    </a>
  );
}
