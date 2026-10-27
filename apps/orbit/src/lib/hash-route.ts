import { useCallback, useEffect, useState } from "react";
import type { ItemKind, ItemRef } from "../model";

export type Section =
  | "overview"
  | "graph"
  | "domains"
  | "actors"
  | "entities"
  | "interfaces"
  | "capabilities"
  | "rules"
  | "journeys";

export type Route = { section: Section; id: string | null };

const SECTIONS: Section[] = [
  "overview",
  "graph",
  "domains",
  "actors",
  "entities",
  "interfaces",
  "capabilities",
  "rules",
  "journeys",
];

const KIND_SECTION: Record<ItemKind, Section> = {
  domain: "domains",
  actor: "actors",
  entity: "entities",
  interface: "interfaces",
  capability: "capabilities",
  rule: "rules",
  journey: "journeys",
};

export function isSection(value: string): value is Section {
  return (SECTIONS as string[]).includes(value);
}

export function parseHash(hash: string): Route {
  const [section = "", ...rest] = hash.replace(/^#\/?/, "").split("/");
  if (!isSection(section)) return { section: "overview", id: null };
  // The graph addresses a node as kind/id, so the id may carry a slash.
  const id = rest.filter(Boolean).map(decodeURIComponent).join("/");
  return { section, id: id || null };
}

export function hrefFor(ref: ItemRef): string {
  return `#/${KIND_SECTION[ref.kind]}/${encodeURIComponent(ref.id)}`;
}

export function hrefForSection(section: Section): string {
  return `#/${section}`;
}

export function useHashRoute(): Route & {
  navigate: (ref: ItemRef) => void;
  close: () => void;
} {
  const [route, setRoute] = useState<Route>(() =>
    parseHash(window.location.hash),
  );

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = useCallback((ref: ItemRef) => {
    window.location.hash = hrefFor(ref);
  }, []);
  const close = useCallback(() => {
    window.location.hash = hrefForSection(
      parseHash(window.location.hash).section,
    );
  }, []);

  return { ...route, navigate, close };
}
