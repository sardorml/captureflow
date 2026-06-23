# CaptureFlow Conventions

The canonical standard for this repo. Every change — human or AI — follows it, so
the codebase stays organized, scalable, and safe to evolve. Rules are derived from
what the codebase already does well; where practice is inconsistent, the rule states
which form **wins for new code**. Each rule names a real exemplar to copy.

> If a rule here ever feels wrong, change _the rule_ in a PR — don't quietly diverge.
> One convention, applied everywhere, is worth more than any local preference.

---

## 0. Non-negotiables (the rules that keep it in best shape)

1. **Behavior-preserving refactors are separate from behavior changes** — one logical
   change per commit, never mixed. (§10)
2. **Green baseline before and after every change**: `pnpm typecheck` + the relevant
   build + `pnpm --filter @captureflow/web test` all pass. Add a characterization
   test before refactoring untested logic. (§9)
3. **Never trust the client.** Re-verify identity/authorization in every server action
   and route; validate every persisted/untrusted blob through a `hydrate*` function. (§5)
4. **Cloudflare bindings are request-scoped** — resolve per call via the `cf-env`
   wrappers, never cache a binding at module scope. (§5)
5. **One source of truth.** Channels → `IPC_CHANNELS`; visibility → `canViewResource`;
   CORS/errors → the `cors` modules; SQL → the db facades; cross-process types →
   `shared/types.ts`; package APIs → the barrel `index.ts`. Don't re-implement these inline. (§1, §5, §6)
6. **Prefer the simplest idiomatic form.** A function, a discriminated union, or a small
   factory beats a class hierarchy or a named GoF pattern. Don't add abstraction for a
   hypothetical future. (§8, §10)
7. **Respect the boundaries.** Dependency graph is one-directional (apps → packages,
   never the reverse, never app → app). The `share`/`snap` domains stay forked. (§1)
8. **Comments are minimal; types are self-explanatory.** (§8)

---

## 1. Architecture & module boundaries

- **One-directional dependency graph.** `apps/*` depend on `packages/*`; packages never
  import apps; apps never import each other. `apps/web` uses `@captureflow/{ui,quota,shared}`;
  `apps/desktop` uses none of them and ships its own renderer UI (incompatible runtimes —
  Cloudflare vs Electron). _Avoid:_ importing `@captureflow/web` from a package, or
  `@captureflow/ui` from desktop. The desktop/web UI duplication is intentional, not debt.
- **Packages expose one public surface** via a barrel `src/index.ts` (plus `@captureflow/ui`'s
  explicit subpaths like `./button`, `./cn`). Import the named export from `@captureflow/<pkg>`;
  never deep-reach into `@captureflow/quota/src/workspaces`. Adding a UI component means
  re-exporting it from the barrel.
- **`apps/web` is sorted by kind.** Route segments + route-local components under `app/`
  (route groups like `(dashboard)`; shared route fragments under `app/_components/`);
  cross-route React under `components/{ui,marketing}`; all non-component logic under `lib/`.
  Use the `@/...` alias, never long relative chains. _Avoid:_ reusable logic inside a route
  folder, or a plain utility under `components/`.
- **The `share` (recordings, `/r`, `/api/r`) and `snap` (screenshots, `/s`, `/api/s`)
  domains are deliberately forked.** Each has its own `lib/<domain>/` twin set (`db`, `types`,
  `quota`, `r2`, `cf-env`, `verify-session`, `device-tokens`, `cors`, `title`) and its own
  route tree. Add per-domain code in the matching folder; **do not merge them** into a shared
  `lib/media/`. Dashboard list/read helpers are the exception — they live in flat top-level
  `lib/shares-db.ts` / `lib/snaps-db.ts`.
- **Cloudflare bindings (D1/R2/env) are resolved lazily per request** via the `cf-env`
  accessors; the db wrappers re-resolve on every call. _Why:_ bindings are request-scoped;
  a cached reference leaks data across requests (see the comment in `lib/share/db.ts`).
  _Avoid:_ `const db = …` at module top level.

## 2. Naming

- **Files:** PascalCase `.tsx` for route-/feature-co-located components (`app/r/[id]/ShareViewer.tsx`,
  `app/(dashboard)/Sidebar.tsx`); **kebab-case** for everything else — design-system/marketing
  components (`components/ui/button.tsx`, `components/marketing/hero-section.tsx`), all
  `lib/` modules, hooks, stores, package files, and desktop `src/main`/`src/shared`. Next.js
  reserved files stay lowercase (`page.tsx`, `layout.tsx`, `route.ts`, `not-found.tsx`).
  Rule for new code: **library/design-system component = kebab; app feature component = Pascal.**
- **Components** are named `function Component(props) {}` (PascalCase) and exported by name;
  the file's default/primary export matches the filename. Reserve `forwardRef`/arrow form for
  primitives that genuinely need a ref or `cva` wrapping (§4).
- **Hooks:** `use-x.ts` exports `useX` (1:1 file↔hook).
- **Function verbs:** `get*` (read), `list*` (collection read), `create*`/`insert*`/`put*`
  (write), `update*`/`set*` (mutate), `delete*`/`softDelete*` (remove), `ensure*`/`resolve*`
  (idempotent lookup), `validate*`/`verify*` (check), `is*`/`has*`/`can*` (predicate).
- **Booleans** (vars, props, predicates) start with `is/has/can/should/allow`.
- **Event handlers:** callback **props** are always `onX` (`onChange`, `onSeek`). Local
  handlers: `onX` in web, `handleX` in the desktop renderer (match the app you're in).
- **Constants** are `UPPER_SNAKE_CASE`; fixed string enumerations (IPC channels) are a single
  `UPPER_SNAKE`-keyed `as const` object.
- **Types/interfaces** are PascalCase; a component's props type is `ComponentNameProps`.

## 3. TypeScript & type modeling

- **Inherit strict mode from `tsconfig.base.json`** (`strict`, `noUncheckedIndexedAccess`,
  `verbatimModuleSyntax`, `isolatedModules`, `moduleResolution: bundler`). Never relax a
  strictness flag in a leaf package without an inline comment explaining why (the only existing
  opt-out, in `apps/web`, is commented).
- **Model domain data with `export type`, not `interface`.** Reserve `interface` for React
  prop bags and declaration-merging (`Window`, `CloudflareEnv`).
- **Discriminated unions for multi-state values and outcomes.** Tag UI/protocol state with a
  `kind` field; tag fallible results with `ok` (`{ ok: true; … } | { ok: false; error; code?; status? }`).
  _Avoid:_ flat optional-everywhere bags (`{ signedIn?, token?, error? }`).
- **No `enum`** — use string-literal unions (`'public' | 'workspace' | 'private'`) and re-check
  them with explicit equality at boundaries before persisting.
- **`any`/`as any` are banned**; prefer `unknown` + narrowing. The rare unavoidable `any` (native
  FFI) carries an `eslint-disable-next-line` + comment.
- **`import type`** for type-only imports; inline `, type X` for mixed imports (required by
  `verbatimModuleSyntax`).
- **Validate untrusted/persisted JSON through a `hydrate*(raw: unknown): T`**: narrow to
  `Record<string, unknown>`, check each field, clamp/cap lengths, fall back to a `DEFAULT_*`
  constant. _Example:_ `lib/share-config.ts` `hydrateShareConfig`. _Avoid:_ `JSON.parse(raw) as T`.
- **Map D1 rows in one `rowFromD1()` per module:** type the raw row as a local `D1Row`, apply
  string-literal casts (`r.col as ShareState`) only here, `?? default` for nullable/legacy
  columns. Callers consume clean camelCase domain types. _Example:_ `lib/share/db-d1.ts`.

## 4. React & components

- **Route entry points stay server components.** No `'use client'` in `page.tsx`/`layout.tsx`;
  they fetch data + permission flags on the server and pass them as plain props to client
  islands. Client components never re-fetch what the server page already had. Add `'use client'`
  only on the specific interactive leaf.
- **Mutations use `useTransition` + a server action** from a colocated `actions.ts`; show busy
  via `pending`, surface failure by writing `res.error` into a local `error` string rendered
  inline. No manual loading booleans, no toast library, no throwing.
- **Optimistic toggles snapshot then roll back:** `const previous = …; setX(next);` run the
  action in the transition; on `res.error` restore `previous` and set the error.
- **Encapsulate non-trivial stateful/imperative logic in a custom hook** under `hooks/` that
  returns named `useCallback` actions; keep streams/timers/promises in `useRef` (not state);
  register IPC/event listeners in `useEffect` and **return the unsubscribe**. _Example:_
  `apps/desktop/.../hooks/use-recorder.ts`.
- **Desktop global state = Zustand stores** under `stores/` (`create<State>((set,get)=>…)`,
  data fields then `setX` actions, `localStorage` access in try/catch, read outside React via
  `getState()`). Don't reach for Context/prop-drilling for cross-window state.
- **Prefer React 19 ref-as-prop + plain function components.** Use `forwardRef` only to forward
  a DOM ref to a Radix `asChild`/`Slot` trigger, and set `.displayName` when you do.
- **Desktop renderer** annotates component returns `: React.JSX.Element` and side-effecting
  functions `: void`/`: Promise<void>`; **web** lets inference handle returns. Match the app.

## 5. Server actions, API routes, data access, auth & quota

- **Server actions for same-origin, cookie-authed dashboard mutations** (`'use server'` in
  `app/actions.ts` or a route-local `actions.ts`); **`/api/*` route handlers for the desktop
  app and cross-origin callers** (device bearer token, CORS). Don't `fetch('/api/...')` from a
  dashboard component for data the user owns; don't expose a server action to desktop.
- **Re-verify the caller server-side in every action and mutating route** — actions call
  `requireUserId()`/`requireOwnerWorkspace()`; device endpoints `resolveDeviceTokenToUser(bearer)`;
  session-relay endpoints `verifySession*(cookie)`. Middleware only guards navigation.
- **API responses:** errors via the module-local `jsonError(error, status, code?)`, successes
  wrapped in `withCors(NextResponse.json(...))`, plus an `OPTIONS()` returning `optionsResponse()`.
  Import these from `lib/share/cors.ts` (for `/api/r/*`) or `lib/snap/cors.ts` (`/api/s/*`).
- **Server actions return `{ error: string | null }`** (plus `slug`/id as needed), never throw
  to the client; wrap risky work in try/catch funneling a readable message; `revalidatePath()`
  every affected surface after a successful mutation.
- **Gate visibility with `canViewResource(visitor, resource)` from `lib/visibility.ts`** (public →
  anyone, private → owner, workspace → owner or member). For SQL listing, use the `*ForAdmin`
  facade queries that encode the same owner-OR-workspace-owner clause. Never re-implement the
  branching inline. _Pinned by `lib/visibility.test.ts`._
- **Access D1 only through the db facade modules** (`lib/share/db.ts`, `lib/snap/db.ts`,
  `lib/snaps-db.ts`, `lib/shares-db.ts`, `lib/device-tokens.ts`) or `@captureflow/quota` — never
  raw `.prepare()`/`.bind()` SQL in a route/action. The facade owns the `COLUMNS` list and the
  `rowFromD1` mapping. (Deliberate, commented exceptions: the lemon-webhook and request-access
  routes, which span both domains.)
- **Enforce quota up front, attributed to the workspace OWNER** (`quotaUserId =
workspace?.owner_user_id ?? userId`): check count/storage/limits together via `Promise.all`
  before writing bytes; return 429 `active_limit`/`storage_limit` (413 `duration_exceeded`).
  Skip only for `isDevDevice(deviceId)`.

## 6. Desktop (Electron) main / renderer / IPC

- **Every IPC channel is a key in `IPC_CHANNELS`** (`shared/types.ts`, `as const`,
  UPPER_SNAKE keys → kebab values); all three sides reference the constant, never a bare string.
  (Legacy raw-string overlay/editor channels exist — new channels MUST go through `IPC_CHANNELS`.)
- **All renderer IPC goes through the single `electronAPI` bridge** in `preload/index.ts`,
  mirrored in `Window.electronAPI`. Renderers call `window.electronAPI.*` and never import
  `ipcRenderer`. Keep the runtime object and its `.d.ts` in sync (ideally derive the type via
  `typeof electronAPI`).
- **Bridge method shapes:** request/response = verb + `invoke`/`handle`; fire-and-forget =
  `send`/`on`; main→renderer push = `on<Event>(cb)` that **returns an unsubscribe** calling
  `removeListener` with the captured handler (so `useEffect` can tear it down).
- **Register handlers in `register<Domain>Handlers()`** in `main/ipc/<domain>-handlers.ts`,
  called once from `app.whenReady`; pass cross-window deps as **getter callbacks** (`() =>
recordingWindow`), not direct window-singleton imports (avoids stale captures).
- **Each main subsystem is a module singleton:** state in module-level `let`, `getX()`/`setX()`
  (+ `loadX`/`refreshX`), changes published via a private `EventEmitter` surfaced as
  `onXChange(fn): () => void`. Not a class threaded around.
- **Broadcast to renderers** by iterating `BrowserWindow.getAllWindows()`, skipping
  `isDestroyed()`, then `webContents.send(IPC_CHANNELS.X_CHANGED, state)`; single-window sends
  guard `win && !win.isDestroyed()` first. (The fan-out loop is copy-pasted — extract one
  `broadcast()` helper if you touch them.)
- **Log via `logInfo/logWarn/logError(component, msg)`** from `main/lib/logger.ts`, not
  `console.*`. **Never log or send secrets** — the share bearer token stays in main and is
  stripped from every renderer-facing state.
- **Cross-process types live only in `shared/types.ts`** (imported by both processes); IPC
  payloads are `kind`/`ok`-tagged discriminated unions defined there and reused verbatim.

## 7. Styling & UI

- **Merge dynamic classes through `cn(...)`** (twMerge∘clsx), never template-literal class
  concatenation — so a caller's `className` can override the base. Import `cn` from the app's
  canonical module (`@/lib/utils`) within that app.
- **Multi-variant components use one `cva()` table** (base + variants + `defaultVariants`) and
  export both the component and its `*Variants` fn. New shared-kit code threads className
  outside: `cn(variants({variant, size}), className)`.
- **Use semantic theme tokens, not raw palette colors.** Product/dashboard: `bg-canvas`,
  `text-fg`, `border-line-strong`, `text-accent`, … (theme-aware via `data-theme`). Marketing
  landing: shadcn-style tokens (`text-foreground`, `bg-background`, …) that resolve only inside
  `.marketing-root`. Don't cross the two systems. (~900 legacy `bg-neutral-*` refs exist — new
  code uses tokens.)
- **Animated product surfaces use the `Smooth*` family** from `@captureflow/ui` (Radix +
  motion springs, with the documented Portal/AnimatePresence workarounds). The marketing tree
  has its own CSS-keyframe kit — inside `components/marketing/*` use the local kit, inside `app/`
  use `@captureflow/ui`'s `Smooth*`. Don't hand-wire `motion.div` around raw Radix in product code.
- **Hoist spring configs and lookup maps to module-level `as const`**, not inlined per render.
- **Keyframes live in the surface stylesheet** (`globals.css` product, `marketing.css` landing),
  loops gated behind `prefers-reduced-motion`, triggered via `animate-*` classes. Tailwind v4 is
  CSS-configured — opt external dirs in with `@source` or their classes get tree-shaken.

## 8. Comments

- **Remove any comment the code already explains.** Keep only what a competent engineer could
  NOT infer: a real footgun/regression warning, a non-obvious invariant, units/encoding of a
  binary or wire format, a browser/OS workaround, a spec/bug link. Bias to removal.
- **Always keep:** tooling suppressions (`eslint-disable`, `@ts-expect-error`, `biome-ignore`,
  …), `///` directives, license headers, `TODO`/`FIXME`.
- **Style:** ≤2 lines → `//`; >2 lines → a `/* … */` block with `*` prefixes. **No comments
  inside type/interface declarations** — types are self-explanatory; if one is truly unavoidable
  it must be a single `//` line, never a multi-line block.

## 9. Testing & verification gates

- **Tooling:** pnpm + nx; `tsc --noEmit` for types; **Vitest** for tests (`pnpm --filter
@captureflow/web test`); Prettier for formatting (`pnpm format`). `apps/desktop` has no test
  harness yet — add one (Vitest) before its bigger refactors.
- **Pure logic is tested.** New non-trivial pure functions (formatting, auth/visibility gates,
  hydration, quota math) ship with tests. _Examples:_ `lib/format.test.ts`, `lib/visibility.test.ts`.
- **Before refactoring untested logic, add a characterization test** that pins current behavior;
  refactor against it.
- **A change isn't done until** `pnpm typecheck` passes for all projects, the relevant build
  passes, and tests are green. Prove a "comment-only" or "pure refactor" change really is one
  (e.g. AST-equivalence / reading the diff), don't assume.

## 10. Design-pattern philosophy

The codebase is already idiomatically patterned (Memento for undo, State via discriminated
unions, Strategy via render-prop slots, Singleton via module instances, Facade via lib modules,
Observer via the stores). **Use the TypeScript-idiomatic form, and don't over-apply.**

- Reach for the **simplest** thing that removes real duplication/complexity: a function, a
  discriminated union, a small factory, a render-prop. Name it after what it does, not the GoF
  pattern.
- **Do NOT** introduce a Strategy registry, state-machine library, generic mutation hook, API
  Facade, guard HOF, or Mediator just because a shape repeats — if the sites diverge in ways
  that make a shared abstraction leakier than the duplication, leave the duplication. (See the
  "Do NOT apply" list in `REFACTORING.md`.)
- When unsure whether an abstraction earns its keep, it doesn't. Prefer locality and explicitness.

## 11. Git & change discipline

- **Work on a dedicated branch**, not `main`. Establish a green baseline first.
- **One logical change per commit; never mix a refactor with a behavior change.** Commit messages
  state what changed and (for refactors) that behavior is preserved. Conventional prefixes:
  `feat`/`fix`/`refactor`/`test`/`docs`/`chore`.
- **Big restructurings = many small verified commits**, not one giant edit.
- Don't commit/push unless asked.

## 12. Change checklist (run before opening a PR)

- [ ] On a branch; baseline was green before I started.
- [ ] Followed the conventions above; new files land in the right place with the right casing.
- [ ] No client trust gap: auth re-verified server-side; untrusted input hydrated/validated.
- [ ] No cached request-scoped binding; one source of truth reused (channels/cors/visibility/db facade).
- [ ] Behavior changes and refactors are in separate commits.
- [ ] New pure logic has tests; refactored logic was pinned by a test first.
- [ ] `pnpm typecheck` ✓ · relevant build ✓ · `test` ✓ · `pnpm format` run.
- [ ] Comments minimal; no comments inside type declarations.
- [ ] Diff reads cleanly; no dead code or stray TODO churn.
