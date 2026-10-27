import { ACTORS } from "./actors";
import { CAPABILITIES } from "./capabilities";
import { DOMAINS } from "./domains";
import { ENTITIES } from "./entities";
import { INTERFACES } from "./interfaces";
import { JOURNEYS } from "./journeys";
import { RULES } from "./rules";
import type {
  Actor,
  Capability,
  Domain,
  DomainId,
  Entity,
  Interface,
  ItemKind,
  ItemRef,
  Journey,
  Model,
  Rule,
  Status,
} from "./types";

export * from "./types";

export const MODEL: Model = {
  domains: DOMAINS,
  actors: ACTORS,
  entities: ENTITIES,
  interfaces: INTERFACES,
  capabilities: CAPABILITIES,
  rules: RULES,
  journeys: JOURNEYS,
};

export const ARCHITECTURE = {
  codeName: "Orbit",
  tagline:
    "One home workspace per person. Everyone else orbits it by invitation.",
} as const;

export const STATUS_LABEL: Record<Status, string> = {
  live: "Live",
  draft: "Draft",
  planned: "Planned",
};

export const KIND_LABEL: Record<ItemKind, string> = {
  domain: "Domain",
  actor: "Actor",
  entity: "Entity",
  interface: "Interface",
  capability: "Capability",
  rule: "Business rule",
  journey: "Journey",
};

function byId<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((item) => [item.id, item]));
}

export const DOMAIN_BY_ID = byId(DOMAINS) as Map<DomainId, Domain>;
export const ACTOR_BY_ID = byId(ACTORS);
export const ENTITY_BY_ID = byId(ENTITIES);
export const INTERFACE_BY_ID = byId(INTERFACES);
export const CAPABILITY_BY_ID = byId(CAPABILITIES);
export const RULE_BY_ID = byId(RULES);
export const JOURNEY_BY_ID = byId(JOURNEYS);

export function capabilitiesTouching(entityId: string): Capability[] {
  return CAPABILITIES.filter((c) =>
    c.effects.some((e) => e.entity === entityId),
  );
}

export function capabilitiesByActor(actorId: string): Capability[] {
  return CAPABILITIES.filter((c) => c.actors.includes(actorId));
}

export function capabilitiesOnInterface(interfaceId: string): Capability[] {
  return CAPABILITIES.filter((c) => c.interfaces.includes(interfaceId));
}

export function rulesAttachedTo(capabilityId: string): Rule[] {
  return RULES.filter((r) => r.attachedTo.includes(capabilityId));
}

export function journeysUsing(capabilityId: string): Journey[] {
  return JOURNEYS.filter((j) =>
    j.steps.some((s) => s.capability === capabilityId),
  );
}

export function journeysForActor(actorId: string): Journey[] {
  return JOURNEYS.filter((j) => j.actor === actorId);
}

export function actorsEntering(interfaceId: string): Actor[] {
  return ACTORS.filter((a) => a.enters.includes(interfaceId));
}

export function entitiesInDomain(domainId: DomainId): Entity[] {
  return ENTITIES.filter((e) => e.domain === domainId);
}

export function capabilitiesInDomain(domainId: DomainId): Capability[] {
  return CAPABILITIES.filter((c) => c.domain === domainId);
}

export function rulesInDomain(domainId: DomainId): Rule[] {
  return RULES.filter((r) => r.domains.includes(domainId));
}

export function interfacesForEntity(entityId: string): Interface[] {
  const ids = new Set(
    capabilitiesTouching(entityId).flatMap((c) => c.interfaces),
  );
  return INTERFACES.filter((i) => ids.has(i.id));
}

export function journeysForEntity(entityId: string): Journey[] {
  const ids = new Set(capabilitiesTouching(entityId).map((c) => c.id));
  return JOURNEYS.filter((j) => j.steps.some((s) => ids.has(s.capability)));
}

export function resolveRef(ref: ItemRef): { name: string } | undefined {
  switch (ref.kind) {
    case "domain":
      return DOMAIN_BY_ID.get(ref.id as DomainId);
    case "actor":
      return ACTOR_BY_ID.get(ref.id);
    case "entity":
      return ENTITY_BY_ID.get(ref.id);
    case "interface":
      return INTERFACE_BY_ID.get(ref.id);
    case "capability":
      return CAPABILITY_BY_ID.get(ref.id);
    case "rule": {
      const rule = RULE_BY_ID.get(ref.id);
      return rule ? { name: rule.title } : undefined;
    }
    case "journey":
      return JOURNEY_BY_ID.get(ref.id);
  }
}

/*
 * Every cross-reference in the model must resolve and every id must be unique,
 * otherwise a view renders a dangling link. The test runs this; the app also
 * runs it once at startup so a broken edit is loud in dev.
 */
export function validateModel(model: Model = MODEL): string[] {
  const problems: string[] = [];
  const unique = (kind: string, items: { id: string }[]) => {
    const seen = new Set<string>();
    for (const item of items) {
      if (seen.has(item.id)) problems.push(`${kind} id duplicated: ${item.id}`);
      seen.add(item.id);
    }
    return seen;
  };
  const domains = unique("domain", model.domains);
  const actors = unique("actor", model.actors);
  const entities = unique("entity", model.entities);
  const interfaces = unique("interface", model.interfaces);
  const capabilities = unique("capability", model.capabilities);
  const rules = unique("rule", model.rules);
  unique("journey", model.journeys);

  const expect = (set: Set<string>, id: string, where: string) => {
    if (!set.has(id)) problems.push(`${where} → unknown ${id}`);
  };

  for (const a of model.actors)
    for (const i of a.enters) expect(interfaces, i, `actor ${a.id}.enters`);
  for (const e of model.entities)
    expect(domains, e.domain, `entity ${e.id}.domain`);
  for (const c of model.capabilities) {
    expect(domains, c.domain, `capability ${c.id}.domain`);
    for (const a of c.actors) expect(actors, a, `capability ${c.id}.actors`);
    for (const i of c.interfaces)
      expect(interfaces, i, `capability ${c.id}.interfaces`);
    for (const e of c.effects)
      expect(entities, e.entity, `capability ${c.id}.effects`);
    for (const r of c.rules) expect(rules, r, `capability ${c.id}.rules`);
  }
  for (const r of model.rules) {
    for (const d of r.domains) expect(domains, d, `rule ${r.id}.domains`);
    for (const c of r.attachedTo)
      expect(capabilities, c, `rule ${r.id}.attachedTo`);
  }
  for (const j of model.journeys) {
    expect(actors, j.actor, `journey ${j.id}.actor`);
    for (const s of j.steps)
      expect(capabilities, s.capability, `journey ${j.id}.steps`);
  }
  // A rule attached from one side only would show on the capability but not
  // the rule, or the reverse; require both directions to agree.
  for (const c of model.capabilities)
    for (const r of c.rules) {
      const rule = model.rules.find((x) => x.id === r);
      if (rule && !rule.attachedTo.includes(c.id))
        problems.push(
          `rule ${r} is on capability ${c.id} but not attached back`,
        );
    }
  for (const r of model.rules)
    for (const c of r.attachedTo) {
      const cap = model.capabilities.find((x) => x.id === c);
      if (cap && !cap.rules.includes(r.id))
        problems.push(
          `rule ${r.id} attaches to ${c} but the capability lacks it`,
        );
    }
  return problems;
}
