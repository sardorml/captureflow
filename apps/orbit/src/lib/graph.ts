import {
  CAPABILITY_BY_ID,
  MODEL,
  type DomainId,
  type Effect,
  type Status,
} from "../model";

export type GraphKind =
  | "actor"
  | "interface"
  | "capability"
  | "entity"
  | "rule";

export type GraphNode = {
  key: string;
  kind: GraphKind;
  id: string;
  label: string;
  domain: DomainId | null;
  status: Status | null;
  degree: number;
};

export type GraphEdgeKind = "does" | "through" | "effect" | "governs";

export type GraphEdge = {
  key: string;
  source: string;
  target: string;
  kind: GraphEdgeKind;
  effect: Effect | null;
};

export type Graph = { nodes: GraphNode[]; edges: GraphEdge[] };

export type GraphFilter = {
  kinds: ReadonlySet<GraphKind>;
  domain: DomainId | null;
  status: Status | null;
};

export const GRAPH_KINDS: GraphKind[] = [
  "actor",
  "interface",
  "capability",
  "entity",
  "rule",
];

export const DEFAULT_GRAPH_KINDS: ReadonlySet<GraphKind> = new Set([
  "actor",
  "interface",
  "capability",
  "entity",
]);

export function nodeKey(kind: GraphKind, id: string): string {
  return `${kind}:${id}`;
}

/*
 * Capabilities are the spine: a domain or status filter selects capabilities,
 * and everything else is kept only while something selected still touches it.
 * Edges to a kind that is switched off are dropped with the kind.
 */
export function buildGraph(filter: GraphFilter): Graph {
  const caps = MODEL.capabilities.filter(
    (c) =>
      (filter.domain === null || c.domain === filter.domain) &&
      (filter.status === null || c.status === filter.status),
  );
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const add = (node: Omit<GraphNode, "degree">) => {
    if (!nodes.has(node.key)) nodes.set(node.key, { ...node, degree: 0 });
  };
  const link = (
    source: string,
    target: string,
    kind: GraphEdgeKind,
    effect: Effect | null = null,
  ) => {
    edges.push({
      key: `${source}>${target}:${kind}:${effect ?? ""}`,
      source,
      target,
      kind,
      effect,
    });
  };

  const has = (k: GraphKind) => filter.kinds.has(k);

  for (const c of caps) {
    const cKey = nodeKey("capability", c.id);
    if (has("capability")) {
      add({
        key: cKey,
        kind: "capability",
        id: c.id,
        label: c.name,
        domain: c.domain,
        status: c.status,
      });
    }
    if (has("actor")) {
      for (const a of c.actors) {
        const actor = MODEL.actors.find((x) => x.id === a);
        if (!actor) continue;
        const aKey = nodeKey("actor", a);
        add({
          key: aKey,
          kind: "actor",
          id: a,
          label: actor.name,
          domain: null,
          status: null,
        });
        if (has("capability")) link(aKey, cKey, "does");
      }
    }
    if (has("interface")) {
      for (const i of c.interfaces) {
        const iface = MODEL.interfaces.find((x) => x.id === i);
        if (!iface) continue;
        const iKey = nodeKey("interface", i);
        add({
          key: iKey,
          kind: "interface",
          id: i,
          label: iface.name,
          domain: null,
          status: null,
        });
        if (has("capability")) link(iKey, cKey, "through");
      }
    }
    if (has("entity")) {
      for (const e of c.effects) {
        const entity = MODEL.entities.find((x) => x.id === e.entity);
        if (!entity) continue;
        const eKey = nodeKey("entity", e.entity);
        add({
          key: eKey,
          kind: "entity",
          id: e.entity,
          label: entity.name,
          domain: entity.domain,
          status: entity.status ?? null,
        });
        if (has("capability")) link(cKey, eKey, "effect", e.effect);
      }
    }
    if (has("rule")) {
      for (const r of c.rules) {
        const rule = MODEL.rules.find((x) => x.id === r);
        if (!rule) continue;
        const rKey = nodeKey("rule", r);
        add({
          key: rKey,
          kind: "rule",
          id: r,
          label: rule.title,
          domain: rule.domains[0] ?? null,
          status: rule.status,
        });
        if (has("capability")) link(rKey, cKey, "governs");
      }
    }
  }

  // Without capabilities there is nothing to connect through, so actors fall
  // back to the interfaces they enter.
  if (!has("capability") && has("actor") && has("interface")) {
    for (const a of MODEL.actors) {
      const aKey = nodeKey("actor", a.id);
      if (!nodes.has(aKey)) continue;
      for (const i of a.enters) {
        const iKey = nodeKey("interface", i);
        if (nodes.has(iKey)) link(aKey, iKey, "through");
      }
    }
  }

  for (const e of edges) {
    const s = nodes.get(e.source);
    const t = nodes.get(e.target);
    if (s) s.degree += 1;
    if (t) t.degree += 1;
  }
  return { nodes: [...nodes.values()], edges };
}

export type JourneyPath = {
  steps: { from: string; to: string; index: number }[];
  nodes: Set<string>;
};

export function journeyPath(journeyId: string): JourneyPath | null {
  const journey = MODEL.journeys.find((j) => j.id === journeyId);
  if (!journey) return null;
  const keys = journey.steps
    .filter((s) => CAPABILITY_BY_ID.has(s.capability))
    .map((s) => nodeKey("capability", s.capability));
  const steps: JourneyPath["steps"] = [];
  for (let i = 0; i < keys.length - 1; i++) {
    const from = keys[i];
    const to = keys[i + 1];
    if (from && to) steps.push({ from, to, index: i + 1 });
  }
  return { steps, nodes: new Set(keys) };
}

export function neighbours(graph: Graph, key: string): Set<string> {
  const out = new Set<string>([key]);
  for (const e of graph.edges) {
    if (e.source === key) out.add(e.target);
    if (e.target === key) out.add(e.source);
  }
  return out;
}
