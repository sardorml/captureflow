# Refactoring Backlog

A prioritized, behavior-preserving cleanup backlog for CaptureFlow, produced by a
codebase-wide code-smell scan (14 detectors over 198 files + an adversarial
verification pass). 42 findings confirmed; **none high-severity** — the codebase
is structurally sound. What remains is maintainability debt, dominated by
**duplication** and a handful of **oversized files**.

Discipline: each item is one behavior-preserving refactoring, applied in small
steps against a green baseline (typecheck + build, plus tests where they exist),
and committed on its own. Never mix a refactoring with a behavior change.

> ⚠️ **No test coverage.** `apps/web` and `apps/desktop` had zero tests at the
> time of the scan. A Vitest harness is being added; add characterization tests
> for anything non-trivial before restructuring it.

## Latent bugs surfaced by the scan (fix alongside the related refactor)

- [ ] **`SummaryChapters.tsx:22` `formatTimestamp`** dropped the `h:mm:ss` branch
  (and uses `Math.floor` vs `ActivitySidebar`'s `Math.round`) → chapters past
  60 min render as `75:30` though the UI advertises `H:MM:SS`. Fixed by the
  `lib/format` consolidation.
- [ ] **Preload type drift** — `preload/index.d.ts` declares
  `getPermissions(): { …accessibility: boolean }` but the `index.ts` const omits
  `accessibility`; renderer reads it via the Window augmentation. Fixed by
  deriving `Window.electronAPI` from `typeof electronAPI`.
- [ ] **snap/ vs share/ quota fallbacks diverged** — no-DB path returns in-memory
  totals (share) vs `0` (snap). Reconcile during the snap/share consolidation.

## Quick wins — duplication, small effort, high value

- [ ] **Consolidate formatting helpers → `lib/format.ts`.** `formatBytes` ×4,
  `formatRelative` ×5 (3 different formats), `formatTimestamp` ×2 (divergent),
  `initials`/`initialsOf` ×11 (divergent signatures). Pick one canonical
  relative-time format. *Extract Function / Move Function.*
- [ ] **De-duplicate `share-config`** — 3 copies (`lib/share-config.ts` [documented,
  survivor], `lib/share/share-config.ts`, `app/_components/share/share-config.ts`).
  Keep one canonical module, repoint importers, delete the rest. *Move Function.*
- [ ] **Extract view-authorization predicate.** The visibility ladder
  (`private → owner`; `workspace → owner || member`) is copy-pasted in
  `r/[id]/page.tsx:68,211` and `s/[id]/page.tsx:39,94` (4 copies, security-sensitive).
  Extract `isAuthorizedToView(visitor, row)` into `lib/share`. *Extract Function.*
- [ ] **Share API route boilerplate.** `jsonError` ×18, `extractBearerToken` ×6,
  `DEVICE_HEADER` const ×13 across `app/api/**`. Move into `lib/share/cors.ts`
  (reconcile `ShareApiError`/`SnapApiError`). *Extract Function / Move Function.*
- [ ] **Preload `.d.ts` → `typeof electronAPI`.** ~200 hand-mirrored lines that
  have already drifted. Export the const, set
  `Window.electronAPI: typeof electronAPI`. *Extract Type / single source of truth.*
- [ ] **Delete dead UI families.** `packages/ui` `dialog.tsx` and
  `dropdown-menu.tsx` (plain variants) have zero consumers — only the `smooth-*`
  families are used. *Remove Dead Code* (after confirming no external consumers).

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
