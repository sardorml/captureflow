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
> @captureflow/web test`). `apps/desktop` still has none — add one before its
> bigger refactors. Add characterization tests for anything non-trivial first.

## Progress (branch `refactor/codebase-cleanup`)

Done this pass — each its own verified commit (tsc all projects + tests + web build):
Vitest harness · `lib/format` consolidation (+tests) · `formatTimestamp` bug ·
`share-config` de-dup · dead UI families removed · preload `getPermissions` type.

## Latent bugs surfaced by the scan (fix alongside the related refactor)

- [x] **`SummaryChapters.tsx` `formatTimestamp`** rendered chapters past 60 min as
  `75:30`. Fixed via the `lib/format` consolidation (`f265916`).
- [x] **Preload `getPermissions` type drift** — type omitted `accessibility` the
  runtime returns. Type aligned (`bc61fb6`). *Full `typeof electronAPI` migration
  to prevent future drift still pending below.*
- [ ] **snap/ vs share/ quota fallbacks diverged** — no-DB path returns in-memory
  totals (share) vs `0` (snap). Reconcile during the snap/share consolidation.

## Quick wins — duplication, small effort, high value

- [x] **Consolidate formatting helpers → `lib/format.ts`** (`915817b`). Done for
  the identical copies (`formatBytes`, `formatDuration`, `formatTimestamp`,
  `formatRelativeShort/Long`, single-arg `initials`). *Still TODO:* the divergent
  one-offs — two-arg `initials(name, email)` (UserMenu, MembersList, ProfileForm),
  `viewer-nav`'s object form, and `PendingInvites`' truncated relative format.
- [x] **De-duplicate `share-config`** (`15df95c`) — collapsed 3 copies to the
  documented `lib/share-config.ts`, repointed importers, deleted the rest.
- [x] **Extract view-authorization predicate** (`6bce4bc`) — `canViewResource()`
  in neutral `lib/visibility.ts`, all 4 sites routed through it, pinned by tests.
- [x] **`jsonError` consolidation** (`fbd1dd3`) — moved into `lib/share/cors.ts` /
  `lib/snap/cors.ts`, 15 routes repointed, dead error-type imports dropped.
  *Still TODO:* `extractBearerToken` ×6 and the `DEVICE_HEADER` const ×13 (and the
  two neutral device routes that define their own `withCors`).
- [ ] **Preload `.d.ts` → `typeof electronAPI`.** ~200 hand-mirrored lines that
  have already drifted. Export the const, set
  `Window.electronAPI: typeof electronAPI`. *Extract Type / single source of truth.*
  (The one already-drifted method was fixed in `bc61fb6`; this is the structural
  fix to stop future drift — expect it to surface more drifts to reconcile.)
- [x] **Delete dead UI families** (`ba2f9e6`) — removed the plain `Dialog*` /
  `DropdownMenu*` families from `packages/ui` (zero consumers; only `smooth-*` used).

## Bigger structural items — medium/large effort, do incrementally (tests first)

- [ ] **Unify the `lib/snap/` vs `lib/share/` fork.** `quota`, `cf-env`,
  `verify-session`, `device-tokens`, `cors`, `title`, `db`, `r2`, `types` are
  near-duplicated; some security-sensitive and already drifted. Consolidate into
  shared modules that *inject* the differing bits (env getter, memory fallbacks).
  Touches ~19 share + ~4 snap routes. *Move Function / Parameterize Function.*
- [ ] **`SnapEditorImpl.tsx` (1766 lines).** Split the 10 module-private
  components + constants/factories into sibling files; extract `useHistory`,
  `useSnapImage`, `useSnapTitle`. Also `Background = string` → discriminated
  union (`transparent | solid | gradient`). *Extract Component / Extract Hook / Replace Primitive with Object.*
- [ ] **`SharePlayer.tsx` (component 85–1072).** Extract hooks (`useWebcamSync`,
  `useFullscreen`, `usePiP`, `useControlsAutoHide`, `useSmoothScrubTime`); split
  the ~410-line render. Perf-sensitive rAF + iOS-Safari workarounds — one hook at
  a time. *Extract Hook / Extract Component.*
- [ ] **`desktop/src/main/index.ts` (1502 lines).** Finish the existing
  `ipc/*-handlers.ts` migration: move the screenshot pipeline, `media://` server,
  and cursor-poll subsystem out; thread module globals via getters/setters.
  *Extract Module / Move Function.*
- [ ] **`useRecorder` hook (518 lines).** Split into `useCaptureDevices` /
  `useShareSession` / `useRecorderControls`. Encodes subtle async ordering — tests
  first. *Extract Hook.*
- [ ] **Other oversized components** (extract hooks + leaf components, each tests-first):
  `SelectionOverlay.tsx` (1296), `RecordingToolbar.tsx` (622), `ActivitySidebar.tsx`,
  `ShareEditorImpl.tsx`, `SnapsGrid` `SnapCard`, `SharesList` `ShareCard`,
  `smooth-select.tsx`.
- [ ] **`collaboration-section.tsx` (1152, marketing).** Pure file-split of the 6
  mockups into a `collaboration/` dir; eyeball the page after. *Extract Module.*
- [ ] **Long handlers.** `s/upload` POST (217 lines, 7 phases) and
  `CAPTURE_SCREENSHOT` handler (170 lines) → `Extract Function` per phase.
- [ ] **`native-recorder.ts` module globals** (`proc`/`onStopResolve`/`stdoutBuffer`/…)
  → a `RecorderSession` object with one teardown, to prevent cross-session bleed.
  *Extract Class.*
- [ ] **`compare-plans-section.tsx` index-coupling.** `COMPARE_SECTIONS` (constants)
  and `compare.sections` (i18n copy) are zipped by positional index in two
  renderers → key by id. *Replace Array with Object.*
- [ ] **Desktop observable-store duplication.** `share-usage.ts` / `share-workspaces.ts`
  / `share-connectivity.ts` repeat the `current/inflight/events` + authed-fetch
  pattern → a small `createObservableStore` factory + shared authed-fetch.
