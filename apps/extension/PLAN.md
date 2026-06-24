# CaptureFlow Browser Extension — Implementation Plan

> Status: **planned, not built.** Decisions below are locked unless revised in a follow-up.
> Built with [WXT](https://wxt.dev) as a Manifest V3 extension under `apps/extension`.
> A Loom-style screen recorder that uploads through the **existing** `/api/r/*` (recordings /
> `share` domain) protocol — it is recording **client #3**, alongside the web dashboard and the
> Electron desktop app. No new backend domain.

---

## 0. Findings corrections that drive the design (verified against code)

Two assumptions are **wrong against the actual code** and are treated as hard constraints.

1. **CORS for `/api/r/*` does NOT allow the `Authorization` header.** `apps/web/lib/share/cors.ts:6`
   sets `ALLOW_HEADERS = "Content-Type, x-captureflow-device"`. The extension calls `init` /
   `usage` / `auth/check` with a Bearer header from a `chrome-extension://` origin, which is
   cross-origin, so the browser sends a CORS preflight listing `authorization`; the current
   response omits it and the preflight fails. Desktop dodges this because Electron's
   main-process `fetch` is not subject to browser CORS. The **snap** module already lists
   `Authorization` (`apps/web/lib/snap/cors.ts:9`) — copy that exact spelling. → Backend Change 1.
2. **The screen track must be `video/mp4` (or an explicitly allowed `video/webm`).**
   `apps/web/lib/share/limits.ts` pins `ALLOWED_CONTENT_TYPES = {video/mp4, image/jpeg}` and
   `apps/web/app/api/r/init/route.ts` hardcodes the screen object key as `videos/${slug}.mp4`.
   Chrome's `MediaRecorder` defaults to WebM/VP9; MP4/H.264 only when an OS encoder is present.
   The webcam companion is already reserved as `video/webm` server-side. → Decision 6 + Backend Change 3.

Everything else checks out: the multipart sequence, `CHUNK_BYTES = 5 MiB` and
`MAX_PART_BYTES = 100 MiB`, idempotent `finalize` (returns the URL when `state === "ready"`),
the no-auth `state` probe, `MAX_POSTER_BYTES = 2 MiB`, and `perShareDurationMs ≈ 3602s`
(`packages/quota/src/limits.ts`).

---

## 1. Locked decisions

### Decision 1 — Capture mechanism & where each piece runs

**`navigator.mediaDevices.getDisplayMedia()` is called inside the offscreen document** (created
with the `DISPLAY_MEDIA` reason). Chrome's native picker offers Screen / Window / Tab in one
dialog; the resulting stream feeds the `MediaRecorder`(s) + upload loop. The popup click only
tells the service worker to open the offscreen doc and start — the capture API lives entirely in
the offscreen document. **Verified by the Phase 0 spike** (recorded `video/mp4;codecs=avc1`
straight from the offscreen doc, needing no permission beyond `offscreen`).

| Piece                                                                   | Context                                                                                     |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Mode toggle, source/cam/mic pickers, Start gesture                      | **Popup** (React)                                                                           |
| Recording state machine, offscreen lifecycle, message routing           | **Service worker** (`background.ts`)                                                        |
| `getDisplayMedia` + `MediaRecorder`(s) + upload pump + poster           | **Offscreen doc** (single; reasons `DISPLAY_MEDIA` + `USER_MEDIA`) — **owns durable state** |
| Floating control bar (timer/stop/pause/restart/delete/cam), cam preview | **Content script**, closed Shadow DOM via `createShadowRootUi` (UI only)                    |

No user gesture needs to cross contexts: Chrome does not enforce `getDisplayMedia`'s
transient-activation requirement for offscreen documents, so calling it in response to a SW
message works (confirmed empirically in Phase 0).

**Rejected — `chrome.desktopCapture.chooseDesktopMedia` from the service worker.** A service
worker has no tab, so Chrome rejects the call with _"A target tab is required when called from a
service worker context"_; and when a `targetTab` IS supplied, the returned `streamId` is scoped
to frames in that tab and **cannot be consumed by `getUserMedia` in the offscreen document** (per
the `chrome.desktopCapture` docs). Tried in Phase 0 and confirmed broken — the
`getDisplayMedia`-in-offscreen path above is what works.

**Rejected — content-script recording.** Dies on page navigation/reload and when the popup
closes; "record while I browse" requires the long-lived offscreen doc. `chrome.tabCapture`
(`getMediaStreamId` in the SW → `getUserMedia({chromeMediaSource:'tab'})` in the offscreen doc)
is kept in reserve for a later one-click "record this tab" express mode.

### Decision 2 — Auth: how the extension gets a credential for `/api/r/*`

**`chrome.identity.launchWebAuthFlow`**, device-token (Bearer) model, mapped 1:1 onto the
desktop flow:

- Extension calls `launchWebAuthFlow({ interactive: true, url: "https://captureflow.xyz/auth/callback?label=<browser>&return=https://<EXT_ID>.chromiumapp.org/" })`.
- The web page authenticates the user, calls `issueDeviceToken(session.user.id, label)`
  (`apps/web/lib/device-tokens.ts` — the same issuer desktop uses), and redirects to
  `https://<EXT_ID>.chromiumapp.org/?token=…&id=…`.
- Chrome **intercepts** that redirect (it never navigates a tab there) and hands the URL back to
  `launchWebAuthFlow`'s callback; the extension parses `token`/`id` and stores them.
- All `/api/r/*` calls then send `Authorization: Bearer <token>` + `x-captureflow-device: <id>`,
  exactly like desktop's `shareHeaders()`.

Token validity is probed with `GET /api/r/auth/check` on popup open (200 `{ok,userId}` vs 401 →
clear local auth). The server still enforces everything: `resolveDeviceTokenToUser(bearer)`
re-verifies on every request; bindings stay request-scoped via `getCloudflareEnv()`.

**Rejected — reuse the existing `/auth/callback` anchor-click handoff with a
`chrome-extension://` return.** Chrome **forbids a web tab from navigating to a
`chrome-extension://` URL**, so the auto-click would silently no-op and the token would never
arrive. `launchWebAuthFlow` + the `chromiumapp.org` redirect is the only mechanism that works,
and it needs no web-accessible `auth-return.html`.

**Rejected — better-auth session cookies + `/api/verify-session`.** Host-only cookies aren't
sent cross-origin from an extension; that endpoint's host allow-list excludes the extension
origin. Token-based is what desktop already proved.

`x-captureflow-device` is a per-install opaque quota key (not a secret): `crypto.randomUUID()`
(36 chars, inside the route's `[8,64]` length check), stored in `local:` storage (per-install
semantics matching desktop — **not** `sync:`, which would conflate machines into one quota
identity).

### Decision 3 — Upload: reuse `/api/r/*` exactly

Port `apps/desktop/src/main/lib/share/{share-api-client.ts, share-upload-streamer.ts}` and
`apps/desktop/src/renderer/src/lib/share/share-webcam-uploader.ts` into the offscreen doc.
Exact sequence:

1. **`POST /api/r/init`** — `InitRequest` (`apps/web/lib/share/types.ts`):
   `{ contentType, source:"instant", preset:"share", durationMs?, width, height, title?,
visibility?, hasWebcam, workspaceId? }`; headers `Authorization` + `x-captureflow-device`.
   Returns `InitResponse { slug, uploadId, storageKey, webcamUploadId?, webcamStorageKey? }`.
   **Persist `slug` to `chrome.storage.session` immediately.**
2. **`MediaRecorder.start(timeslice)`** on the screen stream; append each `dataavailable` blob to
   a buffer.
3. **`POST /api/r/part?slug=<slug>&part=<N>`** — drain the buffer when `bytes >= CHUNK_BYTES`
   (5 MiB), body `application/octet-stream`. `partNumber` is **monotonic from 1**; collect each
   `PartResponse.etag` in part order; one in-flight POST per stream. **Cap a drained part below
   ~90 MiB** so it never trips the 100 MiB `MAX_PART_BYTES`. The last part may be `< 5 MiB`.
4. **Webcam (parallel):** if `hasWebcam`, a second `MediaRecorder` (`video/webm`, VP9/VP8+Opus)
   streams to **`POST /api/r/webcam-part?slug&part`** with its own independent `partNumber`/etag list.
5. **Poster:** draw an early screen frame to a canvas → `canvas.toBlob('image/jpeg', 0.8)`
   (verify `< 2 MiB`) → **`POST /api/r/poster?slug=<slug>`** with `content-type: image/jpeg`.
6. **On stop:** flush both recorders (`requestData()` + await pending) → **`POST /api/r/finalize`**
   `{ slug, parts:[{partNumber,etag}…], sizeBytes }` (+ **`/api/r/webcam-finalize`**). `finalize`
   returns `{ url }` → show the share link.

**ETag discipline:** echo `PartResponse.etag` verbatim. **`sizeBytes`** = running total of bytes
POSTed; must be `> 0` and `<= perShareSizeBytes` (500 MiB).

**Durability (offscreen doc is the source of truth):** the offscreen doc itself writes
`{ slug, partNumber, etags[], sizeBytes }` to `chrome.storage.session` after each successful
`/part` (the SW never holds the etags), so a respawned offscreen doc / SW can resume or abort.

**Failure handling — fail fast (desktop parity, no retry):**

- `init` returns **429 `active_limit`/`storage_limit`** or **413 `duration_exceeded`** → "quota
  reached" UX; do not start recording.
- Pause both pumps on `navigator.onLine === false`; resume on `online`. **A part that fails
  mid-flight is fatal** — abort the share (do not retry; matches `share-upload-streamer.ts`).
  Per-part retry is an explicit non-goal for v1; revisit later.
- On any fatal error or user "delete": **`POST /api/r/abort` `{ slug }`** (the route is POST —
  not DELETE) to release the R2 multipart and avoid orphaned quota.
- On network failure during finalize: **`GET /api/r/state?slug=<slug>`** (no auth); if `ready`,
  skip finalize (idempotent).

### Decision 4 — Camera + mic: two independent MediaRecorders

Screen (`/api/r/part` → `/api/r/finalize`) and webcam+mic (`/api/r/webcam-part` →
`/api/r/webcam-finalize`) are **two independent `MediaRecorder`s**, mapped to the backend's
existing dual-track model (`ShareRow.webcam*`). The live circular cam bubble is a preview-only
`<video>` in the content script; the web player overlays the webcam at playback. `pause()`/
`resume()` are called on both recorders in the same tick.

**Rejected — canvas compositing into one stream.** `canvas.captureStream()` throttles to ~1 fps
in background tabs and `OffscreenCanvas` has no `captureStream()`, so a composited recording
stutters the moment the user switches tabs — fatal for record-while-browsing — and discards the
backend's dual-track model and the editable PiP placement the web edit page provides.

### Decision 5 — Reuse vs fork: depend on zero `@captureflow/*` packages

Follow the **desktop precedent** exactly (desktop imports no workspace packages because its
runtime differs). The MV3 runtime (SW + offscreen + content scripts, WXT `#imports`, `chrome.*`)
is just as distinct, and the packages are entangled with Cloudflare/Next: `@captureflow/quota`
calls D1; `@captureflow/ui` is shadcn + Next/Tailwind-CSS-config; `@captureflow/shared`'s
visibility enum (`public|unlisted|private`) is the **wrong** model (the `/api/r` backend uses
`public|workspace|private`).

Fork the handful of wire types into the extension's own `lib/api/types.ts` (structural copies of
`InitRequest`/`InitResponse`/`PartResponse`/`FinalizeRequest`/`FinalizeResponse`/`ShareApiError`/
`ShareVisibility` from `apps/web/lib/share/types.ts`). They are server-validated wire contracts,
so structural duplication is convention-blessed. A **CI text-diff script** (not a cross-app
import — that would violate the boundary rule) guards against silent drift.

### Decision 6 — Screen codec: MP4 with WebM fallback (chosen)

Record the screen track as **`video/mp4;codecs=avc1.42E01E,mp4a.40.2`** when
`MediaRecorder.isTypeSupported` confirms an OS H.264 encoder (init with
`contentType: "video/mp4"`). **Fallback:** if MP4 is unsupported, record
`video/webm;codecs=vp9,opus` (then vp8) and init with `contentType: "video/webm"` — which
requires Backend Change 3. The webcam track is always `video/webm`.

This guarantees universal device support while keeping MP4 the zero-storage-surprise happy path.
(`MP4-only` was rejected: it hard-fails on encoder-less devices.)

---

## 2. Architecture

```
 POPUP ──gesture──▶ SERVICE WORKER ──open doc + "start"──▶ OFFSCREEN DOC
  (pickers,         (state machine,                            (getDisplayMedia,
   Start)            offscreen mgmt,                            2× MediaRecorder,
                     chrome.storage.session)                    5MiB upload pump,
     ▲                     │                                     poster)
     │ launchWebAuthFlow   │ cmd / state                              │ HTTPS (Bearer + device hdr)
     │ (chromiumapp.org)   ▼                                          ▼
  WEB /auth/callback   CONTENT SCRIPT (Shadow-DOM control bar)   apps/web /api/r/*
  → issueDeviceToken    timer · stop · pause · cam toggle         init→part×N(+webcam)→poster→finalize
                                                                  abort · state · auth/check
                                                                  resolveDeviceToken · quota · R2 · D1
```

**Messaging:** one typed `lib/messaging.ts` (`@webext-core/messaging` `defineExtensionMessaging`)
as the single source of truth for cross-context messages (mirrors desktop's `IPC_CHANNELS`
discipline). The SW re-verifies any privileged op regardless of sender.

**State ownership:** the SW is the single writer of high-level recording state; the offscreen doc
is the single writer of live upload state (`slug`/`partNumber`/`etags`/`sizeBytes`). Popup and
content script are projections subscribing via `storage.watch` / messages.

---

## 3. `apps/extension/` file tree (WXT entrypoints + repo conventions)

Naming per CONVENTIONS §2: kebab-case for all `lib/`, hooks, design-system components;
PascalCase `.tsx` for feature components; WXT/Next-reserved files lowercase. No source
`manifest.json` (WXT generates it under `.output/chrome-mv3/`).

```
apps/extension/
├─ PLAN.md                      # this document
├─ package.json                 # @captureflow/extension; no @captureflow/* deps
├─ tsconfig.json                # extends ../../tsconfig.base.json; references .wxt/tsconfig.json
├─ wxt.config.ts                # manifest(fn): permissions, host_permissions, web_accessible_resources; React module
├─ web-ext.config.ts            # dev browser/profile
├─ .env.example                 # WXT_WEB_BASE=https://captureflow.xyz
├─ public/                      # icon-16/32/48/128.png (auto-wired)
├─ assets/                      # bundled, hashed (control-bar icons, cam mask)
│
├─ entrypoints/
│  ├─ background.ts             # SW: state machine, desktopCapture, offscreen lifecycle, router
│  ├─ popup/
│  │  ├─ index.html  main.tsx
│  │  ├─ App.tsx                # mode toggle + header
│  │  ├─ RecorderPanel.tsx      # source picker (Window/Screen/Tab), Start button
│  │  ├─ DevicePickers.tsx      # camera select (incl. "No Camera"), mic (incl. "No microphone")
│  │  ├─ EffectsRow.tsx         # Effects / Blur / More (Phase 3; stubs earlier)
│  │  ├─ SignInGate.tsx         # launchWebAuthFlow entry
│  │  └─ popup.css
│  ├─ offscreen/
│  │  ├─ index.html  main.ts    # capture + recorders + upload pump (recording lives here)
│  └─ control-bar.content/
│     ├─ index.ts               # defineContentScript → createShadowRootUi
│     ├─ ControlBar.tsx         # timer, stop, pause, restart, delete, cam toggle
│     ├─ CamBubble.tsx          # live circular webcam PREVIEW (not recorded here)
│     └─ control-bar.css
│
├─ lib/
│  ├─ messaging.ts              # one @webext-core/messaging ProtocolMap (source of truth)
│  ├─ recording-state.ts        # discriminated union: {kind:'idle'|'preparing'|'recording'|'paused'|'saving'}
│  ├─ storage.ts                # storage.defineItem<T> wrappers (token, deviceId, prefs) + versioning
│  ├─ capture/{get-stream.ts, pick-mime-type.ts}        # pick-mime-type is PURE → Vitest
│  ├─ recorder/{screen-recorder.ts, webcam-recorder.ts, poster.ts}
│  ├─ api/{types.ts, client.ts, upload-streamer.ts}     # forked wire types; upload-streamer core is PURE → Vitest
│  ├─ auth/{pairing.ts, device-id.ts}                   # device-id is PURE → Vitest
│  └─ format.ts                 # mm:ss elapsed → Vitest
│
├─ hooks/{use-recording.ts, use-media-devices.ts}
└─ tests/{pick-mime-type, upload-streamer, device-id, format}.test.ts
```

---

## 4. Required web/backend changes (minimal, additive, separate commits)

Each in its own commit in `apps/web`, behavior-preserving for existing clients (CONVENTIONS §0.1, §11).

1. **(Mandatory) Add `Authorization` to `/api/r/*` CORS allow-headers.**
   `apps/web/lib/share/cors.ts:6` → `const ALLOW_HEADERS = "Content-Type, Authorization, x-captureflow-device";`
   (copy `apps/web/lib/snap/cors.ts:9`). `withCors`/`optionsResponse`/`jsonError` need no edits.
   Desktop unaffected. Add/extend a CORS characterization test asserting `Authorization` is present.
2. **(Mandatory) Allow a `chromiumapp.org` return in `/auth/callback`.**
   In `apps/web/app/auth/callback/page.tsx`, broaden the return-URL guard to allow-list
   `https://<PUBLISHED_EXT_ID>.chromiumapp.org/` (and the dev/unpacked ID). Keep the existing
   `captureflow://` branch. `issueDeviceToken()` and `appendTokenToReturn()` are reused as-is.
   Keep it an explicit allow-list (don't accept arbitrary hosts). **Blocked on the published
   extension ID.**
3. **(In scope — chosen WebM fallback) Allow `video/webm` screen uploads.**
   `apps/web/lib/share/limits.ts` → add `"video/webm"` to `ALLOWED_CONTENT_TYPES`; in
   `apps/web/app/api/r/init/route.ts` make the screen `storageKey` extension-aware (`.webm` when
   `contentType === "video/webm"`, else `.mp4`; posters stay `.jpg`). Confirm the web player and
   poster pipeline tolerate a `.webm` screen object.

Quota attribution already targets the workspace owner; `isDevDevice` already exempts dev devices.
**No new pairing endpoint required.**

---

## 5. Monorepo / CI integration (keeps typecheck / build / format / test green)

- **`package.json`** `@captureflow/extension` (mirrors desktop's script shape; no `@captureflow/*`
  deps): `dev: wxt`, `build: wxt build`, `zip: wxt zip`, `typecheck: wxt prepare && tsc --noEmit`,
  `test: vitest run`, `postinstall: wxt prepare`. Pin `wxt` exactly (pre-1.0, minor bumps breaking).
- **`tsconfig.json`** extends `../../tsconfig.base.json`; `references: [".wxt/tsconfig.json"]`;
  `lib: ["ES2023","DOM","DOM.Iterable","WebWorker"]`; `types: ["chrome"]`. Keep base strictness.
- **`wxt.config.ts`** manifest as a **function** so Chrome-only permissions stay scoped:
  `permissions: [storage, offscreen, desktopCapture, identity, tabs, scripting, activeTab]`
  (+ `tabCapture` Chrome-only, later), `host_permissions: ["https://captureflow.xyz/*","https://*.captureflow.xyz/*"]`,
  `web_accessible_resources: [{ resources: ["offscreen.html"], matches: ["<all_urls>"] }]`.
- **`nx.json`** → append `"{projectRoot}/.output"` to `targetDefaults.build.outputs`. nx
  auto-discovers via the `apps/*` glob.
- **`.github/workflows/ci.yml`** → existing `format:check` / `typecheck` / `build` gates cover the
  new app (`postinstall: wxt prepare` ensures `.wxt` types exist first). **Add**
  `pnpm --filter @captureflow/extension test` next to the web test gate. No deploy job (Chrome Web
  Store upload is manual / a later separate job).
- **`.prettierignore` / `.gitignore`** → add `**/.output` and `**/.wxt`.

**Green-baseline proof after scaffolding:**
`pnpm typecheck && pnpm --filter @captureflow/web test && pnpm --filter @captureflow/extension test && pnpm build && pnpm format:check`.

---

## 6. Phased milestones (each independently shippable, own green baseline)

- **Phase 0 — Scaffold + capture spike (DONE).** Created `apps/extension` skeleton, static popup,
  CI wiring. **Capture spike proven: `getDisplayMedia` in the offscreen doc records `video/mp4`**
  — the architecture is validated (this is what ruled out `chrome.desktopCapture`, see Decision 1).
  Ship gate met: loads unpacked, popup opens, recording lands a byte count, `typecheck/build/format` green.
- **Phase 1 — Auth + screen-only MVP.** `launchWebAuthFlow` + token/device-id storage; land
  Backend Changes 1, 2 & 3 (separate commits). Offscreen doc records the screen and runs
  `init → part×N → finalize`; show the returned `{url}`.
  _Auth is merged into Phase 1 because `init/route.ts:75` requires a bearer token
  unconditionally — `isDevDevice` only relaxes the quota gate, not auth, so there is no
  "unauthenticated upload" path._ Ship gate: a real recording lands a playable share at
  `/r/<slug>` attributed to the signed-in user; `upload-streamer.test.ts` pins part numbering/etags.
- **Phase 2 — Camera + mic (dual stream).** Webcam recorder + pickers ("No Camera"/"No
  microphone"), `hasWebcam` init, parallel `webcam-part → webcam-finalize`, poster frame, live cam
  preview. Ship gate: dual-track share plays with webcam overlay; `webcamState === ready`.
- **Phase 3 — Control-bar UX & effects.** Shadow-DOM control bar (timer/stop/pause/restart/delete/
  cam toggle), re-injection on navigation restoring state from storage, tab-audio loopback via
  `AudioContext`, blur/effects, optional one-click `tabCapture` mode. Ship gate: recording survives
  a full page navigation with a continuous timer.
- **Later — Snap (screenshot) mode.** The popup's screenshot toggle captures a still and posts to
  the **snap** domain (`/api/s/upload`, `apps/web/lib/snap/*`) — a single-shot PUT with its own
  CORS (already allows `Authorization`). Kept forked from `share` (no shared `lib/media/`).

---

## 6a. Toolchain notes (Phase 0 — non-obvious, don't "clean up")

- **`vite@^7.3.5` is pinned in this package's `devDependencies` on purpose.** The monorepo also
  contains `vite@8` (pulled by `apps/web`'s `vitest@4`), which is **Rolldown**-based. WXT accepts
  `vite ^8`, so without this pin pnpm deduped WXT/`@wxt-dev/module-react` onto Rolldown-Vite, and
  `@vitejs/plugin-react@5`'s Rolldown refresh wrapper then crashed every dev transform with
  `Internal server error: Missing field 'moduleType'` (blank popup; prod build was unaffected). The
  direct pin makes WXT's peer Vite resolve to standard Vite 7 (Rollup) in this subtree only — no
  global `pnpm.overrides` (those don't constrain peer resolution and would force `vite@5`→7 on
  `apps/docs`). If you ever migrate the repo to Vite 8 everywhere, move plugin-react to `^6` in
  lockstep and this pin can go.
- **`web-ext.config.ts` sets `disabled: true`** so `pnpm extension` runs the dev server **without**
  auto-launching a browser. Load `.output/chrome-mv3-dev` unpacked manually (any browser, incl.
  Brave) while it runs. Keeps the dev command portable (no per-machine browser path).

---

## 7. Testing strategy

**Vitest (pure logic — CONVENTIONS §9):**

- `pick-mime-type.ts` — stub `isTypeSupported` → returns `{mimeType, contentType}`
  (mp4 → `video/mp4`; vp9/vp8 → `video/webm`; none → error).
- `upload-streamer.ts` — **characterization test (written first)**: parts flush only at ≥5 MiB and
  never exceed the ~90 MiB cap; `partNumber` monotonic from 1; etags collected in order; final
  sub-5 MiB chunk flushed on stop; a failed part is fatal (no retry) and triggers abort;
  `finalize` body `{parts, sizeBytes}` correct. Mock `fetch`.
- `device-id.ts` — generates a `[8,64]`-length id; persists/reads idempotently.
- `format.ts` — `mm:ss` edge cases.
- Web side: a CORS test asserting `Authorization` in allow-headers (Change 1); a `/auth/callback`
  return allow-list test (Change 2).
- **Wire-compat guard:** a standalone CI script that reads `apps/extension/lib/api/types.ts` and
  `apps/web/lib/share/types.ts` textually and flags drift — **not** a cross-app type import.

**Not unit-tested (integration only):** `desktopCapture`/`getUserMedia`/`MediaRecorder`, offscreen
lifecycle, message routing.

**Manual MV3 verification checklist:**

1. `pnpm --filter @captureflow/extension build` → load unpacked from `apps/extension/.output/chrome-mv3`.
2. Inspect the **generated** `.output/chrome-mv3/manifest.json` (no source manifest) — confirm
   `offscreen`/`desktopCapture`/`identity` permissions and `web_accessible_resources`.
3. Popup → Start → native picker shows Screen/Window/Tab → record ~20 s → Stop → open `/r/<slug>`;
   verify it plays.
4. DevTools → Network on the **offscreen** inspector: preflight 204s carry
   `access-control-allow-headers: …Authorization…`; parts ~5 MiB; etags echoed in finalize.
5. Auth: sign in via `launchWebAuthFlow`, confirm `token`/`id` in `chrome.storage.local`, upload
   attributed in dashboard; revoke token → next call 401 clears local auth.
6. Navigation survival (Phase 3): start recording, navigate, confirm the control bar re-injects and
   the timer is continuous; the offscreen doc (capture) persists.
7. Quota: force a small limit → `init` 429 → "quota reached" UX; no recording starts.

---

## 8. Risks & open items

- **Phase-0 capture spike — RESOLVED.** `getDisplayMedia` in the offscreen doc records video on
  Chrome/Brave (macOS). `chrome.desktopCapture` from the service worker was ruled out (Decision 1).
- **Published extension ID** is required for Backend Change 2 (`chromiumapp.org` allow-list) and is
  a Phase-1 blocker; pin a `key` in the manifest / reserve the Web Store listing to fix the ID early.
- **Duration cap is mandatory client-side enforcement.** The server only checks
  `perShareDurationMs` when `durationMs` is sent at `init`, which a streaming recorder doesn't know,
  and `finalize` does not re-check duration. → enforce a hard client stop (default **30 min** for
  v1) and/or send a conservative `durationMs` estimate at `init`.
- **Single offscreen document** — creating a second silently kills the first; guard every
  `createDocument` with `hasDocument()`; one long-lived doc carries both `DISPLAY_MEDIA` +
  `USER_MEDIA` reasons.
- **SW termination** (30 s idle / 30 s-stalled fetch / 5 min per event): uploads run in the
  offscreen doc, not the SW; persist `slug`/`partNumber`/`etags` to `chrome.storage.session` so a
  respawn resumes/aborts.
- **Abandoned parts on connectivity loss** (inherited from desktop, by choice): a failed in-flight
  part is fatal → `abort` the share to avoid R2 orphans. The server-side stale-`pending` sweep
  should exist.
- **CORS `*` origin + bearer:** the token lives only in extension storage and is never exposed to
  page/content-script contexts (same posture as desktop). Never inject it into a page.
- **Device tokens never expire** (`device_tokens` has only `revoked_at`) — out of scope here; clear
  local auth on any 401 to limit blast radius; flag a later TTL + cleanup job.
- **`createShadowRootUi` quirks:** no HMR (expect content-script reloads while iterating); `rem`
  resolves against the host page's font-size despite `all: initial` — use `px`/container units.

---

## 9. Key reference files (absolute)

- Routes: `apps/web/app/api/r/{init,part,finalize,abort,webcam-part,webcam-finalize,poster,state,usage,auth/check}/route.ts`
- Wire types: `apps/web/lib/share/types.ts`
- **CORS (Change 1):** `apps/web/lib/share/cors.ts:6` (exemplar `apps/web/lib/snap/cors.ts:9`)
- Limits/quota (Change 3 / attribution): `apps/web/lib/share/limits.ts`, `packages/quota/src/limits.ts`
- **Auth (Change 2):** `apps/web/app/auth/callback/page.tsx`, `apps/web/lib/device-tokens.ts`, `apps/web/lib/share/device-tokens.ts`
- Desktop ports: `apps/desktop/src/main/lib/share/{share-api-client.ts,share-upload-streamer.ts}`, `apps/desktop/src/renderer/src/lib/share/share-webcam-uploader.ts`, `apps/desktop/src/main/lib/device-id.ts`, `apps/desktop/src/shared/types.ts`
- Build/CI: `nx.json`, `tsconfig.base.json`, `.github/workflows/ci.yml`, `.prettierignore`, `.gitignore`, `apps/desktop/package.json` (script-shape exemplar)
