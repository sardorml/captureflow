# CaptureFlow — agent guide

**Read [`CONVENTIONS.md`](./CONVENTIONS.md) and follow it.** It is the canonical
standard for this repo; every change follows it. Open `REFACTORING.md` for the
known cleanup backlog (and the "do NOT apply" design-pattern list).

## Repo map

pnpm + nx monorepo. `apps/web` (Next.js 16 + OpenNext/Cloudflare), `apps/desktop`
(Electron), `packages/{ui,quota,shared}`. Apps depend on packages, never the reverse;
apps never depend on each other. The `recording` and `screenshot` domains are deliberately
forked under `lib/recording/` and `lib/screenshot/` — keep them separate.

## Non-negotiables

1. Behavior-preserving refactors are separate commits from behavior changes — never mixed.
2. Green baseline before & after: `pnpm typecheck` + relevant build + `pnpm --filter
@captureflow/web test`. Add a characterization test before refactoring untested logic.
3. Never trust the client: re-verify auth in every server action/route; validate untrusted
   input via a `hydrate*` function.
4. Cloudflare bindings are request-scoped — resolve per call via the `cf-env` wrappers,
   never cache at module scope.
5. One source of truth: `IPC_CHANNELS`, `canViewResource`, the `cors` modules, the db
   facades, `shared/types.ts`, package barrels. Don't re-implement inline.
6. Prefer the simplest idiomatic form (function / discriminated union / small factory) over
   a class hierarchy or a named GoF pattern. Don't over-engineer.
7. Comments are minimal; types are self-explanatory; no comments inside type declarations.

## Commands

- Typecheck (all): `pnpm typecheck`
- Test (web): `pnpm --filter @captureflow/web test`
- Build (web): `pnpm --filter @captureflow/web build`
- Format: `pnpm format`

Work on a branch, not `main`. Commit/push only when asked.
