import { Card } from "@heroui/react";
import {
  ARCHITECTURE,
  MODEL,
  capabilitiesInDomain,
  entitiesInDomain,
  rulesInDomain,
  type Status,
} from "../model";
import { hrefFor, hrefForSection } from "../lib/hash-route";
import {
  KindIcon,
  PageHeader,
  RefLink,
  StatusPill,
} from "../components/primitives";

const COUNTS = [
  {
    section: "entities",
    label: "Entities",
    value: MODEL.entities.length,
    kind: "entity",
  },
  {
    section: "capabilities",
    label: "Capabilities",
    value: MODEL.capabilities.length,
    kind: "capability",
  },
  {
    section: "rules",
    label: "Business rules",
    value: MODEL.rules.length,
    kind: "rule",
  },
  {
    section: "journeys",
    label: "Journeys",
    value: MODEL.journeys.length,
    kind: "journey",
  },
  {
    section: "interfaces",
    label: "Interfaces",
    value: MODEL.interfaces.length,
    kind: "interface",
  },
  {
    section: "actors",
    label: "Actors",
    value: MODEL.actors.length,
    kind: "actor",
  },
] as const;

function countByStatus(status: Status) {
  return (
    MODEL.capabilities.filter((c) => c.status === status).length +
    MODEL.rules.filter((r) => r.status === status).length
  );
}

export function Overview() {
  const changes = [
    ...MODEL.rules
      .filter((r) => r.status !== "live")
      .map((r) => ({ kind: "rule" as const, id: r.id, status: r.status })),
    ...MODEL.capabilities
      .filter((c) => c.status !== "live")
      .map((c) => ({
        kind: "capability" as const,
        id: c.id,
        status: c.status,
      })),
  ];

  return (
    <div className="min-h-full">
      <PageHeader
        kind="overview"
        title={`${ARCHITECTURE.codeName} · CaptureFlow architecture`}
      />
      <div className="flex flex-col gap-8 px-6 py-6">
        <section>
          <p className="max-w-3xl text-lg leading-snug font-medium">
            {ARCHITECTURE.tagline}
          </p>
          <p className="text-muted mt-2 max-w-3xl text-sm">
            Everything the product keeps, who acts on it, through which surface,
            under which rules, and in what order. Every item links to the
            others. Status says whether a thing is live on main, in the
            uncommitted seat draft, or planned for Orbit.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {COUNTS.map((c) => (
              <a
                key={c.section}
                href={hrefForSection(c.section)}
                className="border-border bg-surface hover:bg-background-secondary flex min-w-[9rem] items-center gap-3 rounded-xl border px-4 py-3 transition-colors"
              >
                <KindIcon kind={c.kind} size={18} />
                <span>
                  <span className="block text-xl font-semibold tabular-nums">
                    {c.value}
                  </span>
                  <span className="text-muted block text-xs">{c.label}</span>
                </span>
              </a>
            ))}
            <div className="border-border bg-surface flex items-center gap-4 rounded-xl border px-4 py-3 text-xs">
              {(["live", "draft", "planned"] as Status[]).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <StatusPill status={s} />
                  <b className="tabular-nums">{countByStatus(s)}</b>
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
            The picture
          </h2>
          <OrbitDiagram />
        </section>

        <section>
          <h2 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
            Domains
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {MODEL.domains.map((d) => (
              <a
                key={d.id}
                href={hrefFor({ kind: "domain", id: d.id })}
                className="block"
              >
                <Card className="hover:bg-background-secondary h-full p-4 transition-colors">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-2.5 rounded-full"
                      style={{ background: `oklch(0.65 0.15 ${d.hue})` }}
                    />
                    <span className="font-semibold">{d.name}</span>
                  </div>
                  <p className="text-muted mt-1 text-sm">{d.summary}</p>
                  <p className="text-muted mt-3 text-xs tabular-nums">
                    {entitiesInDomain(d.id).length} entities ·{" "}
                    {capabilitiesInDomain(d.id).length} capabilities ·{" "}
                    {rulesInDomain(d.id).length} rules
                  </p>
                </Card>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-muted mb-3 text-xs font-semibold tracking-wide uppercase">
            What Orbit changes · {changes.length}
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {changes.map((c) => (
              <span
                key={`${c.kind}-${c.id}`}
                className="flex items-center gap-1"
              >
                <RefLink kind={c.kind} id={c.id} />
                <StatusPill status={c.status} />
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/*
 * The model in one picture: a person at the centre with their home workspace,
 * the workspaces they were invited into around it, and viewers outside every
 * orbit because links need no account.
 */
function OrbitDiagram() {
  const stroke = "var(--border)";
  const text = "var(--foreground)";
  const muted = "var(--muted)";
  const accent = "var(--accent)";
  return (
    <Card className="overflow-hidden p-0">
      <svg
        viewBox="0 0 960 420"
        className="block w-full"
        role="img"
        aria-label="Orbit model diagram"
      >
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill={muted} />
          </marker>
        </defs>

        <circle
          cx="300"
          cy="210"
          r="175"
          fill="none"
          stroke={stroke}
          strokeDasharray="4 6"
        />
        <circle
          cx="300"
          cy="210"
          r="95"
          fill="var(--accent-soft)"
          stroke={accent}
        />
        <circle cx="300" cy="210" r="34" fill={accent} />
        <text
          x="300"
          y="215"
          textAnchor="middle"
          fontSize="13"
          fontWeight="600"
          fill="var(--accent-foreground)"
        >
          You
        </text>
        <text
          x="300"
          y="150"
          textAnchor="middle"
          fontSize="12"
          fontWeight="600"
          fill={text}
        >
          Your home workspace
        </text>
        <text x="300" y="282" textAnchor="middle" fontSize="11" fill={muted}>
          Free: 25 × 5 min · data saver
        </text>
        <text x="300" y="297" textAnchor="middle" fontSize="11" fill={muted}>
          Team: $10 a seat · 20 GB a seat, pooled
        </text>

        <g>
          <rect
            x="455"
            y="55"
            width="190"
            height="64"
            rx="12"
            fill="var(--surface)"
            stroke={accent}
          />
          <text
            x="550"
            y="80"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={text}
          >
            Ana's workspace · Team
          </text>
          <text x="550" y="98" textAnchor="middle" fontSize="11" fill={muted}>
            You are a seat. Ana pays.
          </text>
          <line
            x1="395"
            y1="160"
            x2="455"
            y2="105"
            stroke={muted}
            markerEnd="url(#arrow)"
          />
          <text x="400" y="120" fontSize="10" fill={muted}>
            invited
          </text>
        </g>
        <g>
          <rect
            x="455"
            y="300"
            width="190"
            height="64"
            rx="12"
            fill="var(--surface)"
            stroke={stroke}
          />
          <text
            x="550"
            y="325"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={text}
          >
            Bo's workspace · Free
          </text>
          <text x="550" y="343" textAnchor="middle" fontSize="11" fill={muted}>
            Your one free allowance applies.
          </text>
          <line
            x1="395"
            y1="260"
            x2="455"
            y2="315"
            stroke={muted}
            markerEnd="url(#arrow)"
          />
          <text x="400" y="305" fontSize="10" fill={muted}>
            invited
          </text>
        </g>
        <g>
          <rect
            x="20"
            y="178"
            width="170"
            height="64"
            rx="12"
            fill="var(--surface)"
            stroke={stroke}
          />
          <text
            x="105"
            y="203"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={text}
          >
            Your teammates
          </text>
          <text x="105" y="221" textAnchor="middle" fontSize="11" fill={muted}>
            members are seats · viewers are free
          </text>
          <line
            x1="190"
            y1="210"
            x2="205"
            y2="210"
            stroke={muted}
            markerEnd="url(#arrow)"
          />
        </g>

        <g>
          <rect
            x="715"
            y="150"
            width="200"
            height="120"
            rx="14"
            fill="var(--success-soft)"
            stroke="var(--success)"
          />
          <text
            x="815"
            y="180"
            textAnchor="middle"
            fontSize="12"
            fontWeight="600"
            fill={text}
          >
            Anyone with a link
          </text>
          <text x="815" y="200" textAnchor="middle" fontSize="11" fill={muted}>
            watches, comments, reacts
          </text>
          <text x="815" y="216" textAnchor="middle" fontSize="11" fill={muted}>
            no account, no seat, no limit
          </text>
          <text
            x="815"
            y="246"
            textAnchor="middle"
            fontSize="11"
            fontWeight="600"
            fill="var(--success)"
          >
            always free
          </text>
          <line
            x1="645"
            y1="87"
            x2="715"
            y2="170"
            stroke={muted}
            markerEnd="url(#arrow)"
          />
          <line
            x1="645"
            y1="332"
            x2="715"
            y2="250"
            stroke={muted}
            markerEnd="url(#arrow)"
          />
          <text x="655" y="128" fontSize="10" fill={muted}>
            share link
          </text>
          <text x="655" y="300" fontSize="10" fill={muted}>
            share link
          </text>
        </g>

        <text x="300" y="400" textAnchor="middle" fontSize="11" fill={muted}>
          Recordings stay in the workspace they were made in. Leaving changes
          who you are, not where they live.
        </text>
      </svg>
    </Card>
  );
}
