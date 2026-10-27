import { useMemo, useState } from "react";
import { Button } from "@heroui/react";
import { X } from "lucide-react";
import {
  MODEL,
  capabilitiesByActor,
  capabilitiesTouching,
  interfacesForEntity,
  journeysForActor,
  journeysForEntity,
  type Capability,
  type DomainId,
  type Effect,
  type Entity,
} from "../model";
import { hrefFor } from "../lib/hash-route";
import {
  EffectPill,
  FilterButtons,
  Group,
  KindIcon,
  PageHeader,
  Row,
} from "../components/primitives";

type View = "list" | "matrix";

export function EntitiesView({ selectedId }: { selectedId: string | null }) {
  const [domain, setDomain] = useState<DomainId | null>(null);
  const [changedBy, setChangedBy] = useState<string[]>([]);
  const [view, setView] = useState<View>("list");

  const entities = useMemo(() => {
    return MODEL.entities.filter((e) => {
      if (domain && e.domain !== domain) return false;
      if (changedBy.length > 0) {
        const touching = new Set(capabilitiesTouching(e.id).map((c) => c.id));
        return changedBy.some((id) => touching.has(id));
      }
      return true;
    });
  }, [domain, changedBy]);

  const showActors = domain === null && changedBy.length === 0;

  return (
    <div className="min-h-full">
      <PageHeader kind="entity" title="Entities" count={MODEL.entities.length}>
        <FilterButtons
          label="Domain"
          options={MODEL.domains.map((d) => ({ id: d.id, label: d.name }))}
          value={domain}
          onChange={setDomain}
        />
        <ChangedByPicker value={changedBy} onChange={setChangedBy} />
        <div className="ml-auto flex items-center gap-1.5">
          <Button
            size="sm"
            variant={view === "list" ? "primary" : "secondary"}
            onPress={() => setView("list")}
          >
            List
          </Button>
          <Button
            size="sm"
            variant={view === "matrix" ? "primary" : "secondary"}
            onPress={() => setView("matrix")}
          >
            Changes matrix
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-4 px-6 py-5">
        {view === "matrix" ? (
          <Matrix
            entities={entities}
            changedBy={changedBy}
            selectedId={selectedId}
          />
        ) : (
          <>
            {showActors ? (
              <Group
                title="Actors"
                count={MODEL.actors.length}
                icon={<KindIcon kind="actor" />}
              >
                <div className="flex flex-col gap-2">
                  {MODEL.actors.map((a) => (
                    <Row
                      key={a.id}
                      kind="actor"
                      name={a.name}
                      description={a.description}
                      sub={
                        <>
                          Enters{" "}
                          {a.enters
                            .map(
                              (i) =>
                                MODEL.interfaces.find((x) => x.id === i)?.name,
                            )
                            .join(" · ")}
                        </>
                      }
                      meta={[
                        {
                          value: a.enters.length,
                          label:
                            a.enters.length === 1 ? "interface" : "interfaces",
                        },
                        {
                          value: capabilitiesByActor(a.id).length,
                          label: "capabilities",
                        },
                        {
                          value: journeysForActor(a.id).length,
                          label: "journeys",
                        },
                      ]}
                      href={hrefFor({ kind: "actor", id: a.id })}
                      isActive={false}
                    />
                  ))}
                </div>
              </Group>
            ) : null}
            {MODEL.domains.map((d) => {
              const rows = entities.filter((e) => e.domain === d.id);
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
                  <div className="flex flex-col gap-2">
                    {rows.map((e) => (
                      <EntityRow
                        key={e.id}
                        entity={e}
                        isActive={selectedId === e.id}
                      />
                    ))}
                  </div>
                </Group>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function EntityRow({
  entity,
  isActive,
}: {
  entity: Entity;
  isActive: boolean;
}) {
  const caps = capabilitiesTouching(entity.id);
  const changers = caps.filter((c) =>
    c.effects.some((e) => e.entity === entity.id && e.effect !== "reads"),
  );
  return (
    <Row
      kind="entity"
      name={entity.name}
      status={entity.status}
      description={entity.description}
      sub={
        changers.length > 0 ? (
          <>
            Changed by{" "}
            {changers
              .slice(0, 2)
              .map((c) => c.name)
              .join(" · ")}
            {changers.length > 2 ? ` +${changers.length - 2}` : ""}
          </>
        ) : undefined
      }
      meta={[
        { value: entity.facts.length, label: "facts" },
        { value: entity.states.length, label: "states" },
        { value: caps.length, label: "capabilities" },
        { value: interfacesForEntity(entity.id).length, label: "interfaces" },
        { value: journeysForEntity(entity.id).length, label: "journeys" },
      ]}
      href={hrefFor({ kind: "entity", id: entity.id })}
      isActive={isActive}
    />
  );
}

function ChangedByPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-muted mr-1 text-[11px] font-semibold tracking-wide uppercase">
        Changed by
      </span>
      <select
        className="border-border bg-background h-8 rounded-md border px-2 text-sm"
        value=""
        onChange={(e) => {
          const id = e.target.value;
          if (id && !value.includes(id)) onChange([...value, id]);
        }}
      >
        <option value="">Add a capability…</option>
        {MODEL.capabilities
          .filter((c) => !value.includes(c.id))
          .map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
      </select>
      {value.map((id) => (
        <span
          key={id}
          className="bg-default-soft inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium"
        >
          <KindIcon kind="capability" size={12} />
          {MODEL.capabilities.find((c) => c.id === id)?.name}
          <button
            type="button"
            aria-label="Remove"
            className="text-muted hover:text-foreground"
            onClick={() => onChange(value.filter((v) => v !== id))}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {value.length > 0 ? (
        <Button size="sm" variant="ghost" onPress={() => onChange([])}>
          Clear
        </Button>
      ) : null}
    </div>
  );
}

/*
 * Entity × capability. Columns are the chosen capabilities, or every
 * capability that writes to a shown entity when none is chosen; reads are
 * left out of the default so the grid stays about change.
 */
function Matrix({
  entities,
  changedBy,
  selectedId,
}: {
  entities: Entity[];
  changedBy: string[];
  selectedId: string | null;
}) {
  const columns: Capability[] = useMemo(() => {
    if (changedBy.length > 0)
      return MODEL.capabilities.filter((c) => changedBy.includes(c.id));
    const ids = new Set(entities.map((e) => e.id));
    return MODEL.capabilities.filter((c) =>
      c.effects.some((e) => ids.has(e.entity) && e.effect !== "reads"),
    );
  }, [entities, changedBy]);

  const cell = (entity: Entity, cap: Capability): Effect[] =>
    cap.effects.filter((e) => e.entity === entity.id).map((e) => e.effect);

  return (
    <div className="border-border bg-surface overflow-auto rounded-xl border">
      <table className="w-max min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border-border bg-surface sticky left-0 z-10 border-r border-b px-3 py-3 text-left align-bottom">
              <span className="text-muted block text-[11px] font-semibold tracking-wide uppercase">
                Entity ↓ · Capability →
              </span>
            </th>
            {columns.map((c) => (
              <th
                key={c.id}
                className="border-border border-b px-3 py-3 text-left align-bottom font-semibold"
              >
                <a
                  href={hrefFor({ kind: "capability", id: c.id })}
                  className="flex max-w-[11rem] items-start gap-1.5 hover:underline"
                >
                  <KindIcon kind="capability" size={14} />
                  <span className="leading-tight">{c.name}</span>
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {entities.map((e) => (
            <tr
              key={e.id}
              className={selectedId === e.id ? "bg-accent-soft" : ""}
            >
              <th className="border-border bg-surface sticky left-0 z-10 border-r border-b px-3 py-2.5 text-left font-semibold">
                <a
                  href={hrefFor({ kind: "entity", id: e.id })}
                  className="flex items-center gap-1.5 hover:underline"
                >
                  <KindIcon kind="entity" size={14} />
                  {e.name}
                </a>
              </th>
              {columns.map((c) => {
                const effects = cell(e, c);
                return (
                  <td
                    key={c.id}
                    className="border-border border-b px-3 py-2.5 align-middle"
                  >
                    {effects.length === 0 ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <span className="flex flex-wrap gap-1">
                        {effects.map((x) => (
                          <EffectPill key={x} effect={x} />
                        ))}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
