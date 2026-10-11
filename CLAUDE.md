# CaptureFlow — agent guide

**Read [`CONVENTIONS.md`](./CONVENTIONS.md) and follow it.** It is the canonical
standard for this repo; every change follows it. Open `REFACTORING.md` for the
known cleanup backlog (and the "do NOT apply" design-pattern list).

## Repo map

pnpm + nx monorepo.

- `apps/web` — Next.js 16 + OpenNext on Cloudflare Workers (D1 + R2): landing, blog,
  dashboard, viewers, API.
- `apps/admin` — instance-admin Worker on its own host, same D1/R2 (see its README).
- `apps/mailer` — product-email Worker: sends admin-written campaigns off a queue via Resend, serves unsubscribe.
- `apps/extension` — WXT/MV3 Chrome extension recorder.
- `apps/desktop` — Electron macOS recorder.
- `apps/docs` — VitePress docs site.
- `packages/engine` — capture pipeline shared by desktop + extension (MIT; Swift sidecar).
- `packages/admin` — admin auth/data logic behind `apps/admin`.
- `packages/mail` — campaign SQL, rendering, unsubscribe tokens and Resend delivery for admin + mailer.
- `packages/{quota,ui,shared}`.

Apps depend on packages, never the reverse; apps never depend on each other. The
`recording` and `screenshot` domains are deliberately forked under `lib/recording/` and
`lib/screenshot/` — keep them separate.

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
- Test: `pnpm --filter @captureflow/web test` · `@captureflow/extension test` ·
  `@captureflow/engine test` · `@captureflow/admin test`
- Build (web): `pnpm --filter @captureflow/web build` — never while `next dev` serves
  `apps/web`; it corrupts `.next`.
- Extension store zip: `pnpm --filter @captureflow/extension zip`
- Format: `pnpm format`

## Gotchas

- After editing `packages/engine/**/*.swift`, run `packages/engine/scripts/build-native.sh`
  and commit the rebuilt binaries.
- Signed-out visitors are sent to `/login` only for paths listed in
  `apps/web/lib/app-routes.ts`; any other unknown path is a 404. Add new dashboard
  routes there.
- Blog posts are Markdown in `apps/web/content/blog/`: register each in
  `apps/web/lib/blog/posts.ts`, run `python3 scripts/gen-blog-images.py` for its preview
  image, and add it to `apps/web/public/llms.txt`.

Work on a branch, not `main`. Commit/push only when asked.
