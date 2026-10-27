import { Chip } from "@heroui/react";
import {
  MODEL,
  actorsEntering,
  capabilitiesByActor,
  capabilitiesInDomain,
  capabilitiesOnInterface,
  entitiesInDomain,
  journeysForActor,
  rulesInDomain,
} from "../model";
import { hrefFor } from "../lib/hash-route";
import { PageHeader, Row } from "../components/primitives";

export function ActorsView({ selectedId }: { selectedId: string | null }) {
  return (
    <div className="min-h-full">
      <PageHeader kind="actor" title="Actors" count={MODEL.actors.length} />
      <div className="flex flex-col gap-2 px-6 py-5">
        {MODEL.actors.map((a) => (
          <Row
            key={a.id}
            kind="actor"
            name={a.name}
            description={a.description}
            sub={
              <>
                <Chip size="sm" variant="soft" color="default">
                  {a.kind === "system"
                    ? "system"
                    : a.isExternal
                      ? "external"
                      : "internal"}
                </Chip>{" "}
                Enters{" "}
                {a.enters
                  .map((i) => MODEL.interfaces.find((x) => x.id === i)?.name)
                  .join(" · ")}
              </>
            }
            meta={[
              { value: a.enters.length, label: "interfaces" },
              {
                value: capabilitiesByActor(a.id).length,
                label: "capabilities",
              },
              { value: journeysForActor(a.id).length, label: "journeys" },
            ]}
            href={hrefFor({ kind: "actor", id: a.id })}
            isActive={selectedId === a.id}
          />
        ))}
      </div>
    </div>
  );
}

export function InterfacesView({ selectedId }: { selectedId: string | null }) {
  return (
    <div className="min-h-full">
      <PageHeader
        kind="interface"
        title="Interfaces"
        count={MODEL.interfaces.length}
      />
      <div className="flex flex-col gap-2 px-6 py-5">
        {MODEL.interfaces.map((i) => (
          <Row
            key={i.id}
            kind="interface"
            name={i.name}
            description={i.description}
            sub={
              <>
                <Chip size="sm" variant="soft" color="default">
                  {i.kind}
                </Chip>{" "}
                <code>{i.path}</code>
              </>
            }
            meta={[
              { value: actorsEntering(i.id).length, label: "actors" },
              {
                value: capabilitiesOnInterface(i.id).length,
                label: "capabilities",
              },
            ]}
            href={hrefFor({ kind: "interface", id: i.id })}
            isActive={selectedId === i.id}
          />
        ))}
      </div>
    </div>
  );
}

export function DomainsView({ selectedId }: { selectedId: string | null }) {
  return (
    <div className="min-h-full">
      <PageHeader kind="domain" title="Domains" count={MODEL.domains.length} />
      <div className="flex flex-col gap-2 px-6 py-5">
        {MODEL.domains.map((d) => (
          <Row
            key={d.id}
            kind="domain"
            name={d.name}
            description={d.summary}
            meta={[
              { value: entitiesInDomain(d.id).length, label: "entities" },
              {
                value: capabilitiesInDomain(d.id).length,
                label: "capabilities",
              },
              { value: rulesInDomain(d.id).length, label: "rules" },
            ]}
            href={hrefFor({ kind: "domain", id: d.id })}
            isActive={selectedId === d.id}
          />
        ))}
      </div>
    </div>
  );
}
