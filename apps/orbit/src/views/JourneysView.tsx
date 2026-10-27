import { useState } from "react";
import { Card } from "@heroui/react";
import { ACTOR_BY_ID, CAPABILITY_BY_ID, MODEL, type Journey } from "../model";
import { hrefFor } from "../lib/hash-route";
import {
  FilterButtons,
  KindIcon,
  PageHeader,
  StatusPill,
} from "../components/primitives";

export function JourneysView({ selectedId }: { selectedId: string | null }) {
  const [actor, setActor] = useState<string | null>(null);
  const shown = MODEL.journeys.filter(
    (j) => actor === null || j.actor === actor,
  );
  const actors = MODEL.actors.filter((a) =>
    MODEL.journeys.some((j) => j.actor === a.id),
  );

  return (
    <div className="min-h-full">
      <PageHeader kind="journey" title="Journeys" count={MODEL.journeys.length}>
        <FilterButtons
          label="Actor"
          options={actors.map((a) => ({ id: a.id, label: a.name }))}
          value={actor}
          onChange={setActor}
        />
      </PageHeader>
      <div className="flex flex-col gap-4 px-6 py-5">
        {shown.map((j) => (
          <JourneyCard key={j.id} journey={j} isActive={selectedId === j.id} />
        ))}
      </div>
    </div>
  );
}

function JourneyCard({
  journey,
  isActive,
}: {
  journey: Journey;
  isActive: boolean;
}) {
  return (
    <Card className={"p-4 " + (isActive ? "bg-accent-soft" : "")}>
      <a
        href={hrefFor({ kind: "journey", id: journey.id })}
        className="flex flex-wrap items-center gap-2 hover:underline"
      >
        <KindIcon kind="journey" />
        <span className="font-semibold">{journey.name}</span>
        <StatusPill status={journey.status} />
        <span className="text-muted text-xs">
          · {ACTOR_BY_ID.get(journey.actor)?.name}
        </span>
      </a>
      <p className="text-muted mt-1 text-sm">{journey.description}</p>
      <ol className="mt-4 flex items-stretch gap-2 overflow-x-auto pb-1">
        {journey.steps.map((s, i) => {
          const cap = CAPABILITY_BY_ID.get(s.capability);
          return (
            <li
              key={`${s.capability}-${i}`}
              className="flex items-center gap-2"
            >
              <a
                href={hrefFor({ kind: "capability", id: s.capability })}
                className="border-border bg-background hover:bg-background-secondary flex h-full w-48 shrink-0 flex-col rounded-lg border px-3 py-2 transition-colors"
              >
                <span className="text-muted text-[11px] font-semibold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-sm leading-tight font-semibold">
                  {cap?.name ?? s.capability}
                </span>
                {s.note ? (
                  <span className="text-muted mt-1 text-xs">{s.note}</span>
                ) : null}
                {cap ? (
                  <span className="mt-auto pt-2">
                    <StatusPill status={cap.status} />
                  </span>
                ) : null}
              </a>
              {i < journey.steps.length - 1 ? (
                <span className="text-muted shrink-0">→</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
