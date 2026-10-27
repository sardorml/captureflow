import { useState } from "react";
import {
  MODEL,
  STATUS_LABEL,
  journeysUsing,
  type DomainId,
  type Status,
} from "../model";
import { hrefFor } from "../lib/hash-route";
import {
  FilterButtons,
  Group,
  PageHeader,
  Row,
} from "../components/primitives";

export function CapabilitiesView({
  selectedId,
}: {
  selectedId: string | null;
}) {
  const [actor, setActor] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [iface, setIface] = useState<string | null>(null);

  const shown = MODEL.capabilities.filter(
    (c) =>
      (actor === null || c.actors.includes(actor)) &&
      (status === null || c.status === status) &&
      (iface === null || c.interfaces.includes(iface)),
  );

  return (
    <div className="min-h-full">
      <PageHeader
        kind="capability"
        title="Capabilities"
        count={MODEL.capabilities.length}
      >
        <FilterButtons
          label="Actor"
          options={MODEL.actors.map((a) => ({ id: a.id, label: a.name }))}
          value={actor}
          onChange={setActor}
        />
        <FilterButtons
          label="Interface"
          options={MODEL.interfaces.map((i) => ({ id: i.id, label: i.name }))}
          value={iface}
          onChange={setIface}
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
      </PageHeader>
      <div className="flex flex-col gap-4 px-6 py-5">
        {MODEL.domains.map((d) => {
          const rows = shown.filter((c) => c.domain === (d.id as DomainId));
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
                {rows.map((c) => (
                  <Row
                    key={c.id}
                    kind="capability"
                    name={c.name}
                    status={c.status}
                    description={c.description}
                    sub={
                      <>
                        {c.actors
                          .map(
                            (a) => MODEL.actors.find((x) => x.id === a)?.name,
                          )
                          .join(", ")}
                        {" · "}
                        {c.interfaces
                          .map(
                            (i) =>
                              MODEL.interfaces.find((x) => x.id === i)?.name,
                          )
                          .join(", ")}
                      </>
                    }
                    meta={[
                      { value: c.effects.length, label: "effects" },
                      { value: c.rules.length, label: "rules" },
                      { value: journeysUsing(c.id).length, label: "journeys" },
                    ]}
                    href={hrefFor({ kind: "capability", id: c.id })}
                    isActive={selectedId === c.id}
                  />
                ))}
              </div>
            </Group>
          );
        })}
      </div>
    </div>
  );
}
