export type Status = "live" | "draft" | "planned";

export type DomainId =
  | "accounts"
  | "workspaces"
  | "recordings"
  | "screenshots"
  | "sharing"
  | "billing"
  | "capture"
  | "operations";

export type Domain = {
  id: DomainId;
  name: string;
  summary: string;
  hue: number;
};

export type Actor = {
  id: string;
  name: string;
  kind: "person" | "system";
  isExternal: boolean;
  description: string;
  enters: string[];
};

export type Entity = {
  id: string;
  name: string;
  domain: DomainId;
  description: string;
  storage: string;
  facts: string[];
  states: string[];
  status?: Status;
};

export type Interface = {
  id: string;
  name: string;
  kind:
    | "web page"
    | "web app"
    | "browser extension"
    | "desktop app"
    | "http api"
    | "webhook"
    | "scheduled job"
    | "queue"
    | "console"
    | "email";
  description: string;
  path: string;
};

export type Effect = "creates" | "changes" | "removes" | "reads";

export type Capability = {
  id: string;
  name: string;
  domain: DomainId;
  actors: string[];
  interfaces: string[];
  description: string;
  effects: { entity: string; effect: Effect }[];
  rules: string[];
  code: string[];
  status: Status;
};

export type Rule = {
  id: string;
  title: string;
  text: string;
  domains: DomainId[];
  attachedTo: string[];
  status: Status;
};

export type Journey = {
  id: string;
  name: string;
  actor: string;
  description: string;
  steps: { capability: string; note?: string }[];
  status: Status;
};

export type Model = {
  domains: Domain[];
  actors: Actor[];
  entities: Entity[];
  interfaces: Interface[];
  capabilities: Capability[];
  rules: Rule[];
  journeys: Journey[];
};

export type ItemKind =
  | "domain"
  | "actor"
  | "entity"
  | "interface"
  | "capability"
  | "rule"
  | "journey";

export type ItemRef = { kind: ItemKind; id: string };
