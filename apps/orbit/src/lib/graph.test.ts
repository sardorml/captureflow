import { describe, expect, it } from "vitest";
import { MODEL } from "../model";
import {
  DEFAULT_GRAPH_KINDS,
  buildGraph,
  journeyPath,
  neighbours,
  nodeKey,
} from "./graph";

const ALL = {
  kinds: new Set([
    "actor",
    "interface",
    "capability",
    "entity",
    "rule",
  ] as const),
  domain: null,
  status: null,
};

describe("buildGraph", () => {
  it("connects every edge to two present nodes", () => {
    const g = buildGraph(ALL);
    const keys = new Set(g.nodes.map((n) => n.key));
    const dangling = g.edges.filter(
      (e) => !keys.has(e.source) || !keys.has(e.target),
    );
    expect(dangling).toEqual([]);
  });

  it("leaves no node without an edge", () => {
    const g = buildGraph({ ...ALL, kinds: DEFAULT_GRAPH_KINDS });
    expect(g.nodes.filter((n) => n.degree === 0).map((n) => n.key)).toEqual([]);
  });

  it("narrows to a domain through its capabilities", () => {
    const g = buildGraph({ ...ALL, domain: "billing" });
    const caps = g.nodes.filter((n) => n.kind === "capability");
    expect(caps.length).toBe(
      MODEL.capabilities.filter((c) => c.domain === "billing").length,
    );
    expect(caps.every((n) => n.domain === "billing")).toBe(true);
  });

  it("drops a kind and its edges when switched off", () => {
    const g = buildGraph({
      ...ALL,
      kinds: new Set(["capability", "entity"] as const),
    });
    expect(g.nodes.some((n) => n.kind === "actor")).toBe(false);
    expect(g.edges.every((e) => e.kind === "effect")).toBe(true);
  });
});

describe("journeyPath", () => {
  it("orders the steps of a journey over capability nodes", () => {
    const first = MODEL.journeys[0];
    if (!first) throw new Error("model has no journeys");
    const path = journeyPath(first.id);
    expect(path?.steps.length).toBe(first.steps.length - 1);
    expect(path?.steps[0]?.from).toBe(
      nodeKey("capability", first.steps[0]!.capability),
    );
  });
});

describe("neighbours", () => {
  it("includes the node itself and everything one edge away", () => {
    const g = buildGraph(ALL);
    const key = nodeKey("capability", "sign-up");
    const n = neighbours(g, key);
    expect(n.has(key)).toBe(true);
    expect(n.has(nodeKey("actor", "visitor"))).toBe(true);
    expect(n.has(nodeKey("entity", "account"))).toBe(true);
  });
});
