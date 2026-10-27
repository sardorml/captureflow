import { Button, Chip } from "@heroui/react";
import { X } from "lucide-react";
import {
  ACTOR_BY_ID,
  CAPABILITY_BY_ID,
  DOMAIN_BY_ID,
  ENTITY_BY_ID,
  INTERFACE_BY_ID,
  JOURNEY_BY_ID,
  KIND_LABEL,
  RULE_BY_ID,
  actorsEntering,
  capabilitiesByActor,
  capabilitiesInDomain,
  capabilitiesOnInterface,
  capabilitiesTouching,
  entitiesInDomain,
  interfacesForEntity,
  journeysForActor,
  journeysForEntity,
  journeysUsing,
  rulesInDomain,
  type DomainId,
  type Effect,
  type ItemKind,
} from "../model";
import { affectedEntities } from "./RulesView";
import {
  DomainDot,
  EffectPill,
  Field,
  KindIcon,
  RefLink,
  RefList,
  StatusPill,
} from "../components/primitives";

const EFFECT_ORDER: Effect[] = ["creates", "changes", "removes", "reads"];

export function DetailPanel({
  kind,
  id,
  onClose,
}: {
  kind: ItemKind;
  id: string;
  onClose: () => void;
}) {
  const body = render(kind, id);
  return (
    <aside className="border-border bg-surface flex h-full w-[30rem] shrink-0 flex-col border-l">
      <div className="border-border flex items-center gap-2 border-b px-5 py-3">
        <KindIcon kind={kind} />
        <span className="text-muted text-xs font-semibold tracking-wide uppercase">
          {KIND_LABEL[kind]}
        </span>
        <Button
          size="sm"
          variant="ghost"
          isIconOnly
          aria-label="Close"
          className="ml-auto"
          onPress={onClose}
        >
          <X size={16} />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {body ?? (
          <p className="text-muted text-sm">
            Nothing in the model has the id “{id}”.
          </p>
        )}
      </div>
    </aside>
  );
}

function Title({
  name,
  status,
  children,
}: {
  name: string;
  status?: "live" | "draft" | "planned";
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
        {status ? <StatusPill status={status} /> : null}
      </div>
      {children ? (
        <p className="text-muted mt-1.5 text-sm leading-relaxed">{children}</p>
      ) : null}
    </div>
  );
}

function Stack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function render(kind: ItemKind, id: string) {
  switch (kind) {
    case "entity": {
      const e = ENTITY_BY_ID.get(id);
      if (!e) return null;
      const caps = capabilitiesTouching(e.id);
      const rules = [...new Set(caps.flatMap((c) => c.rules))];
      return (
        <Stack>
          <Title name={e.name} status={e.status}>
            {e.description}
          </Title>
          <Field label="Domain">
            <RefLink kind="domain" id={e.domain} />
          </Field>
          <Field label="Stored in">
            <code className="text-xs">{e.storage}</code>
          </Field>
          <Field label={`Facts · ${e.facts.length}`}>
            <div className="flex flex-wrap gap-1">
              {e.facts.map((f) => (
                <code
                  key={f}
                  className="bg-default-soft rounded px-1.5 py-0.5 text-xs"
                >
                  {f}
                </code>
              ))}
            </div>
          </Field>
          <Field label={`States · ${e.states.length}`}>
            {e.states.length === 0 ? (
              <span className="text-muted text-xs">stateless</span>
            ) : (
              <div className="flex flex-wrap gap-1">
                {e.states.map((s) => (
                  <Chip key={s} size="sm" variant="soft" color="default">
                    {s}
                  </Chip>
                ))}
              </div>
            )}
          </Field>
          {EFFECT_ORDER.map((effect) => {
            const ids = caps
              .filter((c) =>
                c.effects.some((x) => x.entity === e.id && x.effect === effect),
              )
              .map((c) => c.id);
            if (ids.length === 0) return null;
            return (
              <Field key={effect} label={`${effect} it · ${ids.length}`}>
                <RefList kind="capability" ids={ids} />
              </Field>
            );
          })}
          <Field label="Interfaces">
            <RefList
              kind="interface"
              ids={interfacesForEntity(e.id).map((i) => i.id)}
            />
          </Field>
          <Field label="Rules that touch it">
            <RefList kind="rule" ids={rules} />
          </Field>
          <Field label="Journeys">
            <RefList
              kind="journey"
              ids={journeysForEntity(e.id).map((j) => j.id)}
            />
          </Field>
        </Stack>
      );
    }
    case "capability": {
      const c = CAPABILITY_BY_ID.get(id);
      if (!c) return null;
      return (
        <Stack>
          <Title name={c.name} status={c.status}>
            {c.description}
          </Title>
          <Field label="Domain">
            <RefLink kind="domain" id={c.domain} />
          </Field>
          <Field label="Who">
            <RefList kind="actor" ids={c.actors} />
          </Field>
          <Field label="Through">
            <RefList kind="interface" ids={c.interfaces} />
          </Field>
          <Field label={`Effects · ${c.effects.length}`}>
            {c.effects.length === 0 ? (
              <span className="text-muted text-xs">changes nothing stored</span>
            ) : (
              <ul className="flex flex-col gap-1">
                {c.effects.map((x) => (
                  <li
                    key={`${x.entity}-${x.effect}`}
                    className="flex items-center gap-2"
                  >
                    <EffectPill effect={x.effect} />
                    <RefLink kind="entity" id={x.entity} />
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label={`Rules · ${c.rules.length}`}>
            <RefList kind="rule" ids={c.rules} />
          </Field>
          <Field label="Journeys">
            <RefList
              kind="journey"
              ids={journeysUsing(c.id).map((j) => j.id)}
            />
          </Field>
          <Field label="Code">
            <ul className="flex flex-col gap-0.5">
              {c.code.map((p) => (
                <li key={p}>
                  <code className="text-xs break-all">{p}</code>
                </li>
              ))}
            </ul>
          </Field>
        </Stack>
      );
    }
    case "rule": {
      const r = RULE_BY_ID.get(id);
      if (!r) return null;
      return (
        <Stack>
          <Title name={r.title} status={r.status}>
            {r.text}
          </Title>
          <Field label="Domains">
            <RefList kind="domain" ids={r.domains} />
          </Field>
          <Field label={`Attached to · ${r.attachedTo.length}`}>
            <RefList kind="capability" ids={r.attachedTo} />
          </Field>
          <Field label="Entities affected">
            <RefList kind="entity" ids={affectedEntities(r)} />
          </Field>
        </Stack>
      );
    }
    case "journey": {
      const j = JOURNEY_BY_ID.get(id);
      if (!j) return null;
      return (
        <Stack>
          <Title name={j.name} status={j.status}>
            {j.description}
          </Title>
          <Field label="Actor">
            <RefLink kind="actor" id={j.actor} />
          </Field>
          <Field label={`Steps · ${j.steps.length}`}>
            <ol className="flex flex-col gap-1.5">
              {j.steps.map((s, i) => (
                <li
                  key={`${s.capability}-${i}`}
                  className="flex items-start gap-2 text-sm"
                >
                  <span className="text-muted w-5 shrink-0 text-xs tabular-nums">
                    {i + 1}.
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <RefLink kind="capability" id={s.capability} />
                    {s.note ? (
                      <span className="text-muted text-xs">{s.note}</span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ol>
          </Field>
        </Stack>
      );
    }
    case "interface": {
      const i = INTERFACE_BY_ID.get(id);
      if (!i) return null;
      return (
        <Stack>
          <Title name={i.name}>{i.description}</Title>
          <Field label="Kind">
            <Chip size="sm" variant="soft" color="default">
              {i.kind}
            </Chip>
          </Field>
          <Field label="Code">
            <code className="text-xs">{i.path}</code>
          </Field>
          <Field label="Entered by">
            <RefList kind="actor" ids={actorsEntering(i.id).map((a) => a.id)} />
          </Field>
          <Field label="Capabilities">
            <RefList
              kind="capability"
              ids={capabilitiesOnInterface(i.id).map((c) => c.id)}
            />
          </Field>
        </Stack>
      );
    }
    case "actor": {
      const a = ACTOR_BY_ID.get(id);
      if (!a) return null;
      return (
        <Stack>
          <Title name={a.name}>{a.description}</Title>
          <Field label="Kind">
            <Chip size="sm" variant="soft" color="default">
              {a.kind === "system"
                ? "system"
                : a.isExternal
                  ? "external person"
                  : "internal"}
            </Chip>
          </Field>
          <Field label="Enters">
            <RefList kind="interface" ids={a.enters} />
          </Field>
          <Field label="Capabilities">
            <RefList
              kind="capability"
              ids={capabilitiesByActor(a.id).map((c) => c.id)}
            />
          </Field>
          <Field label="Journeys">
            <RefList
              kind="journey"
              ids={journeysForActor(a.id).map((j) => j.id)}
            />
          </Field>
        </Stack>
      );
    }
    case "domain": {
      const d = DOMAIN_BY_ID.get(id as DomainId);
      if (!d) return null;
      return (
        <Stack>
          <Title name={d.name}>{d.summary}</Title>
          <Field label="Colour">
            <DomainDot domain={d.id} />
          </Field>
          <Field label="Entities">
            <RefList
              kind="entity"
              ids={entitiesInDomain(d.id).map((e) => e.id)}
            />
          </Field>
          <Field label="Capabilities">
            <RefList
              kind="capability"
              ids={capabilitiesInDomain(d.id).map((c) => c.id)}
            />
          </Field>
          <Field label="Rules">
            <RefList kind="rule" ids={rulesInDomain(d.id).map((r) => r.id)} />
          </Field>
        </Stack>
      );
    }
  }
}
