# Orbit — CaptureFlow architecture viewer

A developer-only bird's-eye view of the CaptureFlow model under **Orbit**: one
home workspace per person, everyone else orbits it by invitation, every member
of a paid workspace is a seat.

It runs locally and is never deployed. There is no build target on purpose.

```sh
pnpm orbit                              # http://localhost:3035
pnpm --filter @captureflow/orbit test   # every cross-reference resolves
```

## What it shows

- **Graph** — the whole model as one interactive picture: actors, interfaces,
  capabilities, entities and rules as nodes, laid out left to right as who →
  where → what → on what. Pan, zoom, drag, hover to see neighbours, click for
  detail, filter by kind, domain or status, and overlay a journey as numbered
  steps.
- **Domains** — eight areas of the product, each with its entities,
  capabilities and rules.
- **Actors** — who acts: visitor, user, owner, member, the three admin roles,
  Lemon Squeezy, the scheduler and Workers AI.
- **Entities** — everything the product keeps, where it is stored, its facts
  and states, and which capabilities create, change, remove or read it. A
  changes matrix crosses entities with capabilities.
- **Interfaces** — the surfaces things happen through: website, dashboard,
  extension, macOS app, the APIs, the webhook, cron, the queue, the admin
  console and the mailer.
- **Capabilities** — what someone can do, by whom, through which interface,
  with its effects, its rules and the code behind it.
- **Business rules** — what must always hold, attached to the capabilities
  that enforce it.
- **Journeys** — ordered walks through capabilities for one actor.

Every item carries a status: live on `main`, in the uncommitted seat draft, or
planned for Orbit. Numbers such as the free caps and seat price are read from
`@captureflow/quota` at render time.

## Editing

The model is `src/model/*.ts`, one file per kind. Add or move items there; the
views and the detail panel derive everything else. `model.test.ts` fails on a
dangling id or a rule attached from one side only, and the app logs the same
problems to the console in dev.
