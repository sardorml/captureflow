import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@heroui/react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type ZoomTransform } from "d3-zoom";
import {
  MODEL,
  STATUS_LABEL,
  type DomainId,
  type Effect,
  type Status,
} from "../model";
import {
  DEFAULT_GRAPH_KINDS,
  GRAPH_KINDS,
  buildGraph,
  journeyPath,
  neighbours,
  nodeKey,
  type GraphEdge,
  type GraphKind,
  type GraphNode,
} from "../lib/graph";
import { FilterButtons, PageHeader } from "../components/primitives";

type SimNode = GraphNode & SimulationNodeDatum;
type SimLink = SimulationLinkDatum<SimNode> & { edge: GraphEdge };

const KIND_FILL: Record<GraphKind, string> = {
  actor: "#2563eb",
  interface: "#ea580c",
  capability: "#16a34a",
  entity: "#4f46e5",
  rule: "#7c3aed",
};

const KIND_LABEL: Record<GraphKind, string> = {
  actor: "Actors",
  interface: "Interfaces",
  capability: "Capabilities",
  entity: "Entities",
  rule: "Rules",
};

const EFFECT_STROKE: Record<Effect, string> = {
  creates: "#16a34a",
  changes: "#d97706",
  removes: "#dc2626",
  reads: "#9ca3af",
};

// Left-to-right bands so the layout reads as who → where → what → on what.
const BAND: Record<GraphKind, number> = {
  actor: 0,
  interface: 1,
  capability: 2,
  entity: 3,
  rule: 4,
};
const BAND_GAP = 340;

// Labels sit to the right of a node, so the collision radius grows with the
// text or neighbouring labels print over each other.
function collideRadius(node: GraphNode): number {
  return radius(node) + 8 + Math.min(70, node.label.length * 2.4);
}

const DRAG_CLICK_PX = 4;

function radius(node: GraphNode): number {
  return Math.min(18, 6 + Math.sqrt(node.degree) * 2.2);
}

function edgeStroke(edge: GraphEdge): string {
  if (edge.kind === "effect" && edge.effect) return EFFECT_STROKE[edge.effect];
  if (edge.kind === "does") return "#93c5fd";
  if (edge.kind === "governs") return "#c4b5fd";
  return "#d4d4d8";
}

function edgeDash(edge: GraphEdge): string | undefined {
  if (edge.kind === "through") return "4 4";
  if (edge.kind === "governs") return "2 4";
  return undefined;
}

export function GraphView({ selectedKey }: { selectedKey: string | null }) {
  const [kinds, setKinds] =
    useState<ReadonlySet<GraphKind>>(DEFAULT_GRAPH_KINDS);
  const [domain, setDomain] = useState<DomainId | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [journey, setJourney] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState<string | null>(null);

  const graph = useMemo(
    () => buildGraph({ kinds, domain, status }),
    [kinds, domain, status],
  );
  const path = useMemo(
    () => (journey ? journeyPath(journey) : null),
    [journey],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [size, setSize] = useState({ width: 1200, height: 800 });
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);

  // Positions survive filter changes so the picture does not reshuffle on
  // every toggle; only new nodes start from their band.
  const positions = useRef(new Map<string, { x: number; y: number }>());
  const simRef = useRef<Simulation<SimNode, SimLink> | null>(null);
  const zoomRef = useRef<ReturnType<
    typeof zoom<SVGSVGElement, unknown>
  > | null>(null);
  const sizeRef = useRef(size);
  sizeRef.current = size;
  const [nodes, setNodes] = useState<SimNode[]>([]);
  const [links, setLinks] = useState<SimLink[]>([]);
  const [, setFrame] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setSize({
        width: Math.max(300, r.width),
        height: Math.max(300, r.height),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .filter((event: Event) => {
        // Nodes handle their own pointerdown for dragging.
        const target = event.target as Element | null;
        return !target?.closest("[data-node]");
      })
      .on("zoom", (event) => setTransform(event.transform));
    const sel = select(svg);
    sel.call(z);
    zoomRef.current = z;
    sel.call(
      z.transform,
      zoomIdentity.translate(size.width / 2, size.height / 2).scale(0.8),
    );
    return () => {
      sel.on(".zoom", null);
      zoomRef.current = null;
    };
    // Only re-centre when the canvas itself changes size.
  }, [size.width, size.height]);

  const fitToKeys = (keys: string[]) => {
    const svg = svgRef.current;
    const z = zoomRef.current;
    if (!svg || !z) return;
    const pts = keys
      .map((k) => positions.current.get(k))
      .filter((p): p is { x: number; y: number } => p !== undefined);
    if (pts.length === 0) return;
    const minX = Math.min(...pts.map((p) => p.x)) - 60;
    const maxX = Math.max(...pts.map((p) => p.x)) + 220;
    const minY = Math.min(...pts.map((p) => p.y)) - 60;
    const maxY = Math.max(...pts.map((p) => p.y)) + 60;
    const { width, height } = sizeRef.current;
    const k = Math.min(
      1.4,
      (width - 40) / (maxX - minX),
      (height - 40) / (maxY - minY),
    );
    const t = zoomIdentity
      .translate(width / 2, height / 2)
      .scale(k)
      .translate(-(minX + maxX) / 2, -(minY + maxY) / 2);
    select(svg).call(z.transform, t);
  };

  useEffect(() => {
    const simNodes: SimNode[] = graph.nodes.map((n) => {
      const p = positions.current.get(n.key);
      return {
        ...n,
        x: p?.x ?? (BAND[n.kind] - 2) * BAND_GAP + (Math.random() - 0.5) * 40,
        y: p?.y ?? (Math.random() - 0.5) * 400,
      };
    });
    const byKey = new Map(simNodes.map((n) => [n.key, n]));
    const simLinks: SimLink[] = graph.edges
      .filter((e) => byKey.has(e.source) && byKey.has(e.target))
      .map((e) => ({ source: e.source, target: e.target, edge: e }));

    const sim = forceSimulation<SimNode, SimLink>(simNodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(simLinks)
          .id((d) => d.key)
          .distance((l) => (l.edge.kind === "effect" ? 90 : 130))
          .strength(0.35),
      )
      .force("charge", forceManyBody<SimNode>().strength(-420))
      .force(
        "x",
        forceX<SimNode>((d) => (BAND[d.kind] - 2) * BAND_GAP).strength(0.35),
      )
      .force("y", forceY<SimNode>(0).strength(0.02))
      .force("collide", forceCollide<SimNode>(collideRadius).iterations(2))
      .alphaDecay(0.03)
      .on("tick", () => {
        for (const n of simNodes) {
          if (n.x !== undefined && n.y !== undefined)
            positions.current.set(n.key, { x: n.x, y: n.y });
        }
        setFrame((f) => f + 1);
      });

    // Fit the settled picture into the canvas once per build; a drag reheats
    // the simulation but must not snap the view around afterwards.
    let fitted = false;
    sim.on("end", () => {
      if (fitted || simNodes.length === 0) return;
      fitted = true;
      fitToKeys(simNodes.map((n) => n.key));
    });
    simRef.current = sim;
    setNodes(simNodes);
    setLinks(simLinks);
    return () => {
      sim.stop();
    };
  }, [graph]);

  // A selected journey is small against the whole graph, so the view closes
  // in on its steps; clearing it zooms back out to everything.
  useEffect(() => {
    if (nodes.length === 0) return;
    const keys = path ? [...path.nodes] : nodes.map((n) => n.key);
    const timer = window.setTimeout(() => fitToKeys(keys), 50);
    return () => window.clearTimeout(timer);
    // Positions are read from the ref at fit time; nodes only gates readiness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const resetLayout = () => {
    positions.current.clear();
    setKinds(new Set(kinds));
  };

  const selected = selectedKey ? selectedKey.replace("/", ":") : null;
  const present = useMemo(
    () => new Set(graph.nodes.map((n) => n.key)),
    [graph],
  );
  // A selection left over from another filter must not dim the whole graph.
  const focus =
    [hover, selected].find((k): k is string => !!k && present.has(k)) ?? null;
  const highlight = useMemo(() => {
    if (focus) return neighbours(graph, focus);
    if (path) return path.nodes;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      return new Set(
        graph.nodes
          .filter((n) => n.label.toLowerCase().includes(q))
          .map((n) => n.key),
      );
    }
    return null;
  }, [focus, path, query, graph]);
  const isLit = (key: string) => highlight === null || highlight.has(key);
  const edgeLit = (e: GraphEdge) => {
    if (highlight === null) return true;
    if (focus) return e.source === focus || e.target === focus;
    return highlight.has(e.source) && highlight.has(e.target);
  };

  // Drag: pointer capture on the node, coordinates mapped through the zoom
  // transform, and a click only if the pointer barely moved.
  const drag = useRef<{
    node: SimNode;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const toGraph = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    const x = clientX - (rect?.left ?? 0);
    const y = clientY - (rect?.top ?? 0);
    return {
      x: (x - transform.x) / transform.k,
      y: (y - transform.y) / transform.k,
    };
  };
  const onNodeDown =
    (node: SimNode) => (event: React.PointerEvent<SVGGElement>) => {
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = {
        node,
        startX: event.clientX,
        startY: event.clientY,
        moved: false,
      };
      node.fx = node.x;
      node.fy = node.y;
      simRef.current?.alphaTarget(0.25).restart();
    };
  const onNodeMove = (event: React.PointerEvent<SVGGElement>) => {
    const d = drag.current;
    if (!d) return;
    if (
      Math.hypot(event.clientX - d.startX, event.clientY - d.startY) >
      DRAG_CLICK_PX
    )
      d.moved = true;
    const p = toGraph(event.clientX, event.clientY);
    d.node.fx = p.x;
    d.node.fy = p.y;
  };
  const onNodeUp =
    (node: SimNode) => (event: React.PointerEvent<SVGGElement>) => {
      const d = drag.current;
      drag.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
      node.fx = null;
      node.fy = null;
      simRef.current?.alphaTarget(0);
      if (d && !d.moved) {
        window.location.hash = `#/graph/${node.kind}/${encodeURIComponent(node.id)}`;
      }
    };

  const nodeByKey = useMemo(
    () => new Map(nodes.map((n) => [n.key, n])),
    [nodes],
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader kind="overview" title="Graph" count={graph.nodes.length}>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted mr-1 text-[11px] font-semibold tracking-wide uppercase">
            Show
          </span>
          {GRAPH_KINDS.map((k) => {
            const on = kinds.has(k);
            return (
              <Button
                key={k}
                size="sm"
                variant={on ? "primary" : "secondary"}
                onPress={() => {
                  const next = new Set(kinds);
                  if (on) next.delete(k);
                  else next.add(k);
                  setKinds(next);
                }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: KIND_FILL[k] }}
                />
                {KIND_LABEL[k]}
              </Button>
            );
          })}
        </div>
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
            Journey
          </span>
          <select
            className="border-border bg-background h-8 max-w-[18rem] rounded-md border px-2 text-sm"
            value={journey ?? ""}
            onChange={(e) => setJourney(e.target.value || null)}
          >
            <option value="">None</option>
            {MODEL.journeys.map((j) => (
              <option key={j.id} value={j.id}>
                {j.name}
              </option>
            ))}
          </select>
        </label>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find a node…"
          className="border-border bg-background h-8 w-44 rounded-md border px-2 text-sm"
        />
        <Button size="sm" variant="ghost" onPress={resetLayout}>
          Reset layout
        </Button>
        <span className="text-muted ml-auto text-xs tabular-nums">
          {graph.nodes.length} nodes · {graph.edges.length} edges
        </span>
      </PageHeader>

      <div
        ref={containerRef}
        className="relative min-h-0 flex-1 overflow-hidden"
      >
        <svg
          ref={svgRef}
          width={size.width}
          height={size.height}
          className="block cursor-grab select-none active:cursor-grabbing"
          onPointerMove={onNodeMove}
        >
          <defs>
            <marker
              id="g-arrow"
              viewBox="0 0 10 10"
              refX="10"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)" />
            </marker>
          </defs>
          <g transform={transform.toString()}>
            <g>
              {links.map((l) => {
                const s = l.source as SimNode;
                const t = l.target as SimNode;
                if (s.x === undefined || t.x === undefined) return null;
                const lit = edgeLit(l.edge);
                return (
                  <line
                    key={l.edge.key}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={edgeStroke(l.edge)}
                    strokeWidth={lit && highlight !== null ? 2 : 1.2}
                    strokeDasharray={edgeDash(l.edge)}
                    opacity={lit ? 0.9 : 0.08}
                  />
                );
              })}
            </g>

            {path ? (
              <g>
                {path.steps.map((step) => {
                  const s = nodeByKey.get(step.from);
                  const t = nodeByKey.get(step.to);
                  if (
                    !s ||
                    !t ||
                    s.x === undefined ||
                    s.y === undefined ||
                    t.x === undefined ||
                    t.y === undefined
                  )
                    return null;
                  const mx = (s.x + t.x) / 2;
                  const my = (s.y + t.y) / 2;
                  const dx = t.x - s.x;
                  const dy = t.y - s.y;
                  const len = Math.hypot(dx, dy) || 1;
                  const cx = mx - (dy / len) * 40;
                  const cy = my + (dx / len) * 40;
                  const tr = radius(t) + 3;
                  const ex = t.x - (dx / len) * tr;
                  const ey = t.y - (dy / len) * tr;
                  const bx = 0.25 * s.x + 0.5 * cx + 0.25 * ex;
                  const by = 0.25 * s.y + 0.5 * cy + 0.25 * ey;
                  return (
                    <g key={`${step.from}>${step.to}`}>
                      <path
                        d={`M${s.x},${s.y} Q${cx},${cy} ${ex},${ey}`}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={3}
                        markerEnd="url(#g-arrow)"
                        opacity={0.9}
                      />
                      <circle cx={bx} cy={by} r={9} fill="var(--accent)" />
                      <text
                        x={bx}
                        y={by + 3.5}
                        textAnchor="middle"
                        fontSize={10}
                        fontWeight={700}
                        fill="var(--accent-foreground)"
                      >
                        {step.index}
                      </text>
                    </g>
                  );
                })}
              </g>
            ) : null}

            <g>
              {nodes.map((n) => {
                if (n.x === undefined || n.y === undefined) return null;
                const r = radius(n);
                const lit = isLit(n.key);
                const isSelected = selected === n.key;
                const onPath = path?.nodes.has(n.key) ?? false;
                return (
                  <g
                    key={n.key}
                    data-node
                    transform={`translate(${n.x},${n.y})`}
                    opacity={lit ? 1 : 0.12}
                    className="cursor-pointer"
                    onPointerDown={onNodeDown(n)}
                    onPointerUp={onNodeUp(n)}
                    onPointerEnter={() => setHover(n.key)}
                    onPointerLeave={() =>
                      setHover((h) => (h === n.key ? null : h))
                    }
                  >
                    <circle
                      r={r}
                      fill={KIND_FILL[n.kind]}
                      stroke={
                        isSelected || onPath
                          ? "var(--accent)"
                          : "var(--surface)"
                      }
                      strokeWidth={isSelected ? 4 : onPath ? 3 : 1.5}
                    />
                    {n.status === "planned" ? (
                      <circle
                        r={r + 3}
                        fill="none"
                        stroke="#d97706"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                    ) : null}
                    {n.status === "draft" ? (
                      <circle
                        r={r + 3}
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                      />
                    ) : null}
                    <text
                      x={r + 5}
                      y={4}
                      fontSize={n.kind === "capability" ? 11 : 12}
                      fontWeight={n.kind === "capability" ? 500 : 600}
                      fill="var(--foreground)"
                      paintOrder="stroke"
                      stroke="var(--background)"
                      strokeWidth={3}
                      strokeLinejoin="round"
                    >
                      {n.label}
                    </text>
                  </g>
                );
              })}
            </g>
          </g>
        </svg>

        <div className="border-border bg-surface/90 absolute bottom-4 left-4 rounded-xl border p-3 text-xs backdrop-blur">
          <div className="flex flex-col gap-1.5">
            {GRAPH_KINDS.map((k) => (
              <span key={k} className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ background: KIND_FILL[k] }}
                />
                {KIND_LABEL[k]}
              </span>
            ))}
            <span className="border-border mt-1 border-t pt-1.5" />
            {(["creates", "changes", "removes", "reads"] as Effect[]).map(
              (e) => (
                <span key={e} className="flex items-center gap-2">
                  <span
                    className="h-0.5 w-5"
                    style={{ background: EFFECT_STROKE[e] }}
                  />
                  {e}
                </span>
              ),
            )}
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 border-t border-dashed border-zinc-400" />
              through an interface
            </span>
            <span className="flex items-center gap-2">
              <span className="h-0.5 w-5 bg-blue-300" />
              actor does
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full border border-dashed border-amber-500" />
              planned · dashed blue is draft
            </span>
          </div>
        </div>

        <p className="text-muted absolute right-4 bottom-4 text-[11px]">
          Scroll to zoom · drag the canvas to pan · drag a node to move it ·
          click a node for detail
        </p>
      </div>
    </div>
  );
}
