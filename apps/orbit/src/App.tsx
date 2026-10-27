import { useEffect } from "react";
import { Compass, Waypoints } from "lucide-react";
import { ARCHITECTURE, validateModel, type ItemKind } from "./model";
import { GraphView } from "./views/GraphView";
import { hrefForSection, useHashRoute, type Section } from "./lib/hash-route";
import { KIND_ICON, KIND_TONE } from "./components/primitives";
import { Overview } from "./views/Overview";
import { EntitiesView } from "./views/EntitiesView";
import { CapabilitiesView } from "./views/CapabilitiesView";
import { RulesView } from "./views/RulesView";
import { JourneysView } from "./views/JourneysView";
import { ActorsView, DomainsView, InterfacesView } from "./views/SimpleLists";
import { DetailPanel } from "./views/DetailPanel";

const NAV: { section: Section; label: string; kind: ItemKind | null }[] = [
  { section: "overview", label: "Overview", kind: null },
  { section: "graph", label: "Graph", kind: null },
  { section: "domains", label: "Domains", kind: "domain" },
  { section: "actors", label: "Actors", kind: "actor" },
  { section: "entities", label: "Entities", kind: "entity" },
  { section: "interfaces", label: "Interfaces", kind: "interface" },
  { section: "capabilities", label: "Capabilities", kind: "capability" },
  { section: "rules", label: "Business rules", kind: "rule" },
  { section: "journeys", label: "Journeys", kind: "journey" },
];

const GRAPH_KINDS = new Set<ItemKind>([
  "actor",
  "interface",
  "capability",
  "entity",
  "rule",
]);

// A graph node is addressed as kind/id; anything else is not a node.
function graphDetail(id: string | null): { kind: ItemKind; id: string } | null {
  if (!id) return null;
  const [kind, ...rest] = id.split("/");
  const itemId = rest.join("/");
  if (!kind || !itemId || !GRAPH_KINDS.has(kind as ItemKind)) return null;
  return { kind: kind as ItemKind, id: itemId };
}

const SECTION_KIND: Record<Exclude<Section, "overview" | "graph">, ItemKind> = {
  domains: "domain",
  actors: "actor",
  entities: "entity",
  interfaces: "interface",
  capabilities: "capability",
  rules: "rule",
  journeys: "journey",
};

export function App() {
  const { section, id, close } = useHashRoute();

  useEffect(() => {
    const problems = validateModel();
    if (problems.length > 0)
      console.error("[orbit] model problems:\n" + problems.join("\n"));
  }, []);

  return (
    <div className="bg-background text-foreground flex h-full">
      <nav className="border-border bg-surface flex w-56 shrink-0 flex-col border-r">
        <a
          href={hrefForSection("overview")}
          className="flex items-center gap-2 px-4 py-4"
        >
          <span className="bg-accent text-accent-foreground flex size-7 items-center justify-center rounded-lg">
            <Compass size={16} />
          </span>
          <span className="font-semibold tracking-tight">
            {ARCHITECTURE.codeName}
          </span>
          <span className="text-muted ml-auto text-[10px] font-semibold tracking-wide uppercase">
            local
          </span>
        </a>
        <ul className="flex flex-col gap-0.5 px-2">
          {NAV.map((item) => {
            const Icon = item.kind
              ? KIND_ICON[item.kind]
              : item.section === "graph"
                ? Waypoints
                : Compass;
            const tone = item.kind ? KIND_TONE[item.kind] : "text-foreground";
            const isActive = section === item.section;
            return (
              <li key={item.section}>
                <a
                  href={hrefForSection(item.section)}
                  className={
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors " +
                    (isActive
                      ? "bg-accent-soft font-semibold"
                      : "hover:bg-background-secondary")
                  }
                >
                  <Icon size={16} className={tone} />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="text-muted mt-auto px-4 py-4 text-[11px] leading-relaxed">
          Developer board. Edit <code>src/model/*.ts</code>; the test keeps
          every link honest.
        </p>
      </nav>

      <main
        className={
          "min-w-0 flex-1 " +
          (section === "graph" ? "overflow-hidden" : "overflow-y-auto")
        }
      >
        {section === "overview" ? <Overview /> : null}
        {section === "graph" ? <GraphView selectedKey={id} /> : null}
        {section === "domains" ? <DomainsView selectedId={id} /> : null}
        {section === "actors" ? <ActorsView selectedId={id} /> : null}
        {section === "entities" ? <EntitiesView selectedId={id} /> : null}
        {section === "interfaces" ? <InterfacesView selectedId={id} /> : null}
        {section === "capabilities" ? (
          <CapabilitiesView selectedId={id} />
        ) : null}
        {section === "rules" ? <RulesView selectedId={id} /> : null}
        {section === "journeys" ? <JourneysView selectedId={id} /> : null}
      </main>

      {section === "graph" ? (
        (() => {
          const node = graphDetail(id);
          return node ? (
            <DetailPanel kind={node.kind} id={node.id} onClose={close} />
          ) : null;
        })()
      ) : id && section !== "overview" ? (
        <DetailPanel kind={SECTION_KIND[section]} id={id} onClose={close} />
      ) : null}
    </div>
  );
}
