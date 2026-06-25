# Refactoring Backlog

A prioritized, behavior-preserving cleanup backlog for CaptureFlow, produced by a
codebase-wide code-smell scan (14 detectors over 198 files + an adversarial
verification pass). 42 findings confirmed; **none high-severity** — the codebase
is structurally sound. What remains is maintainability debt, dominated by
**duplication** and a handful of **oversized files**.

Discipline: each item is one behavior-preserving refactoring, applied in small
steps against a green baseline (typecheck + build, plus tests where they exist),
and committed on its own. Never mix a refactoring with a behavior change.

> ✅ **Test harness added.** `apps/web` now has Vitest (`pnpm --filter
@captureflow/web test`). `apps/desktop` still has none — add one before its
> bigger refactors. Add characterization tests for anything non-trivial first.

## Progress (branch `refactor/codebase-cleanup`)

Done this pass — each its own verified commit (tsc all projects + tests + web build):
Vitest harness · `lib/format` consolidation (+tests) · `formatTimestamp` bug ·
`recording-config` de-dup · dead UI families removed · preload `getPermissions` type.

## Latent bugs surfaced by the scan (fix alongside the related refactor)

- [x] **`SummaryChapters.tsx` `formatTimestamp`** rendered chapters past 60 min as
      `75:30`. Fixed via the `lib/format` consolidation (`f265916`).
- [x] **Preload `getPermissions` type drift** — type omitted `accessibility` the
      runtime returns. Type aligned (`bc61fb6`). _Full `typeof electronAPI` migration
      to prevent future drift still pending below._
- [ ] **screenshot/ vs recording/ quota fallbacks diverged** — no-DB path returns in-memory
      totals (recording) vs `0` (screenshot). Reconcile during the screenshot/recording consolidation.

## Quick wins — duplication, small effort, high value

- [x] **Consolidate formatting helpers → `lib/format.ts`** (`915817b`). Done for
      the identical copies (`formatBytes`, `formatDuration`, `formatTimestamp`,
      `formatRelativeShort/Long`, single-arg `initials`). _Still TODO:_ the divergent
      one-offs — two-arg `initials(name, email)` (UserMenu, MembersList, ProfileForm),
      `viewer-nav`'s object form, and `PendingInvites`' truncated relative format.
- [x] **De-duplicate `recording-config`** (`15df95c`) — collapsed 3 copies to the
      documented `lib/recording-config.ts`, repointed importers, deleted the rest.
- [x] **Extract view-authorization predicate** (`6bce4bc`) — `canViewResource()`
      in neutral `lib/visibility.ts`, all 4 sites routed through it, pinned by tests.
- [x] **`jsonError` consolidation** (`fbd1dd3`) — moved into `lib/recording/cors.ts` /
      `lib/screenshot/cors.ts`, 15 routes repointed, dead error-type imports dropped.
      _Still TODO:_ `extractBearerToken` ×6 and the `DEVICE_HEADER` const ×13 (and the
      two neutral device routes that define their own `withCors`).
- [ ] **Preload `.d.ts` → `typeof electronAPI`.** ~200 hand-mirrored lines that
      have already drifted. Export the const, set
      `Window.electronAPI: typeof electronAPI`. _Extract Type / single source of truth._
      (The one already-drifted method was fixed in `bc61fb6`; this is the structural
      fix to stop future drift — expect it to surface more drifts to reconcile.)
- [x] **Delete dead UI families** (`ba2f9e6`) — removed the plain `Dialog*` /
      `DropdownMenu*` families from `packages/ui` (zero consumers; only `smooth-*` used).

## Bigger structural items — medium/large effort, do incrementally (tests first)

- [ ] **Unify the `lib/screenshot/` vs `lib/recording/` fork.** `quota`, `cf-env`,
      `verify-session`, `device-tokens`, `cors`, `title`, `db`, `r2`, `types` are
      near-duplicated; some security-sensitive and already drifted. Consolidate into
      shared modules that _inject_ the differing bits (env getter, memory fallbacks).
      Touches ~19 recording + ~4 screenshot routes. _Move Function / Parameterize Function._
- [ ] **`ScreenshotEditorImpl.tsx` (1766 lines).** Split the 10 module-private
      components + constants/factories into sibling files; extract `useHistory`,
      `useScreenshotImage`, `useScreenshotTitle`. Also `Background = string` → discriminated
      union (`transparent | solid | gradient`). _Extract Component / Extract Hook / Replace Primitive with Object._
- [ ] **`RecordingPlayer.tsx` (component 85–1072).** Extract hooks (`useWebcamSync`,
      `useFullscreen`, `usePiP`, `useControlsAutoHide`, `useSmoothScrubTime`); split
      the ~410-line render. Perf-sensitive rAF + iOS-Safari workarounds — one hook at
      a time. _Extract Hook / Extract Component._
- [ ] **`desktop/src/main/index.ts` (1502 lines).** Finish the existing
      `ipc/*-handlers.ts` migration: move the screenshot pipeline, `media://` server,
      and cursor-poll subsystem out; thread module globals via getters/setters.
      _Extract Module / Move Function._
- [ ] **`useRecorder` hook (518 lines).** Split into `useCaptureDevices` /
      `useRecordingSession` / `useRecorderControls`. Encodes subtle async ordering — tests
      first. _Extract Hook._
- [ ] **Other oversized components** (extract hooks + leaf components, each tests-first):
      `SelectionOverlay.tsx` (1296), `RecordingToolbar.tsx` (622), `ActivitySidebar.tsx`,
      `RecordingEditorImpl.tsx`, `ScreenshotsGrid` `ScreenshotCard`, `RecordingsList` `RecordingCard`,
      `smooth-select.tsx`.
- [ ] **`collaboration-section.tsx` (1152, marketing).** Pure file-split of the 6
      mockups into a `collaboration/` dir; eyeball the page after. _Extract Module._
- [ ] **Long handlers.** `s/upload` POST (217 lines, 7 phases) and
      `CAPTURE_SCREENSHOT` handler (170 lines) → `Extract Function` per phase.
- [ ] **`native-recorder.ts` module globals** (`proc`/`onStopResolve`/`stdoutBuffer`/…)
      → a `RecorderSession` object with one teardown, to prevent cross-session bleed.
      _Extract Class._
- [ ] **`compare-plans-section.tsx` index-coupling.** `COMPARE_SECTIONS` (constants)
      and `compare.sections` (i18n copy) are zipped by positional index in two
      renderers → key by id. _Replace Array with Object._
- [ ] **Desktop observable-store duplication.** `recording-usage.ts` / `recording-workspaces.ts`
      / `recording-connectivity.ts` repeat the `current/inflight/events` + authed-fetch
      pattern → a small `createObservableStore` factory + shared authed-fetch.

## Design patterns (GoF) analysis

A codebase-wide pass against the GoF catalog (253 files, TS-idiomatic lens, plus an
adversarial over-engineering review). **Verdict: the design is healthy** — 79
idiomatic pattern uses already present, and the skeptic rejected 16 of 23
opportunities as over-engineering. The actionable items below are duplication
removal (the GoF labels are decorative — prefer the plain function/component form);
several overlap the items above. Most value here is the **"do NOT apply"** list.

### Worthwhile (extract the shared thing; tests-first where noted)

- [ ] **`<MediaCard>` from `RecordingCard`/`ScreenshotCard`** (`RecordingsList.tsx`, `ScreenshotsGrid.tsx`)
      — ~800 lines duplicated and already drifted (ScreenshotsGrid hardcodes comment/reaction
      counts to 0; rename actions have different signatures — normalize, don't just
      inject). First safe step: lift the identical `visibilityLabel`/`VisibilityText`
      into one module. (Same as the ScreenshotCard/RecordingCard "Large Class" items above.)
- [ ] **`subscribe<T>(channel)` factory in the preload** (`preload/index.ts`) — ~22
      identical `ipcRenderer.on`/`removeListener` wrappers, each a leak footgun. Plain
      generic closure, not a class. Public contextBridge surface, no tests → verify
      mechanically; helper must accept raw string channels too.
- [ ] **Derive `Window.electronAPI` from `typeof electronAPI`** (`preload/index.d.ts`)
      — same as the preload `.d.ts` item above; route the exported type so the
      web/node tsconfig split stays clean.
- [ ] **One `broadcast(channel, payload)` helper** (`main/ipc/*`) — the all-windows +
      `isDestroyed` loop is copied 6× (`cursor-tracker.ts` already self-factored it).
      Keep it a thin util (called on a high-frequency cursor interval).
- [ ] **`useRecordHandoff()` hook** (`SelectionOverlay.tsx`) — the reset-effect +
      prep→countdown→send/cancel dance is byte-identical across the 3 record overlays
      and tied to the frame-commit footgun. Do NOT fold in the separate `ScreenshotAreaOverlay`
      path; move the two `requestAnimationFrame` commit-waits verbatim.
- [ ] **Local admin-scope SQL `const`** (`screenshots-db.ts`, `recordings-db.ts`) — a
      security-relevant scope clause copied 6× (fail-closed, but drift-prone). A small
      per-file constant — NOT one shared cross-table string (aliased vs bare columns).
- [ ] **`teardownRecordingUI()` helper** (`use-recorder.ts`) — extract only the
      invariant 3-call cleanup (`hideRecordingOverlay`/`hideRecordingDim`/
      `restoreRecordingDisplayMode`) shared by 4 exit paths; leave the varying
      `showWindow`/`hideWebcamBubble` inline (don't encode await/order behind flags).

### Do NOT apply (rejected as over-engineering — recorded so they aren't "fixed")

- **`DRAW_TOOLS` Strategy registry** for shape tools (`ScreenshotEditorImpl`) — breaks the
  `kind→current` union soundness (forces a cast); explicit branches are better.
- **Player `mode` state-machine union** (`RecordingPlayer`) — adds state on top of the
  video-derived booleans (removes none) and risks documented iOS-Safari/bfcache fixes.
- **`useOptimisticMutation` hook** — the 4 sites recording ~5 lines; each is dominated by
  unique side-effects (reaction animation, draft reset) → leaky abstraction.
- **`recordingApi.*` Facade** over the `/api/r/*` fetches — divergent URL/method/return/
  error contracts (one path deliberately doesn't throw).
- **Server-action guard HOF/Decorator** — only 2 of 4 guards are identical; the rest
  return different shapes and one redirects differently. At most Extract Function ×2.
- **`WindowManager` Mediator** (`main/index.ts`) — only 2 sites repeat the precedence
  ladder; the rest are normal liveness guards. Load-bearing macOS focus/paint timing.
- **`createObservableStore` factory across the 4 desktop stores** — only the ~12-line
  scaffold is shared; `set` semantics differ per store (one writes without emitting).
  _(Note: this is more cautious than the observable-store item above — scope it to the
  genuinely-identical scaffold only, or skip.)_
- **`smooth-select` onto Radix** — would kill its per-item animations; the real win is
  just deleting dead `select.tsx` (already covered by dead-code cleanup).
- Plus: marketing `useIntersection`/`useScroll` hooks, a `navLabel` Strategy, an
  `AnimatedFrame`, an artifact-kind Strategy in `request-access`, a CORS Decorator
  factory, and an upload Template Method across the screenshot/recording fork — all rejected:
  the sites are superficially similar but diverge in ways that make a shared
  abstraction leakier than the duplication.

### Over-use already present (mostly leave alone)

- **`lib/screenshot/quota.ts` vs `lib/recording/quota.ts` double-Facade** — drifted (no-D1
  fallback differs); collapse to one parameterized module (= the screenshot/recording-fork item).
- **`compare-plans-section` index-zip** — fragile two-file positional join; if the i18n
  layer is revisited, key copy by a stable `id`. Until then leave it.
- **`modes-intro` nested-`setTimeout` animation** — don't promote to a state-machine
  lib; if touched, flatten to a keyframe array. Decorative widget.
- **`request-access` kind-switch SQL** and **`originForSide` switch** — already the
  simplest correct form; do not convert to Strategy/lookup tables.
