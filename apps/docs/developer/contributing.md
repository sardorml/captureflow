# Contributing

Contributions are welcome. CaptureFlow is [AGPL-3.0-only](https://github.com/sardorml/captureflow/blob/main/LICENSE).

## Sign the CLA

Contributions require signing the
[Contributor License Agreement](https://github.com/sardorml/captureflow/blob/main/CLA.md).
The CLA check runs automatically on pull requests.

## Workflow

1. **Fork & branch** off `main`.
2. **Make your change.** Match the style of the surrounding code.
3. **Verify locally** before opening a PR:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm build
   ```
   Nx caches results, so re-runs are fast.
4. **Open a pull request.** CI runs lint, typecheck, and build; the CLA bot
   checks your signature.

## Project conventions

- **Formatting:** Prettier — `pnpm format` (`*.{ts,tsx,md,json,jsonc,css}`).
- **Monorepo:** put cross-app code in a `packages/*` workspace (`shared`, `ui`,
  or `quota`) rather than duplicating it.
- **Commits:** keep them focused; reference the area you touched.
- **Docs:** user-facing changes should update these docs (`apps/docs`). Use the
  "Edit this page on GitHub" link at the bottom of any page.

## Reporting bugs & ideas

Open an issue on
[GitHub](https://github.com/sardorml/captureflow/issues) with steps to
reproduce, your OS/version, and — for the recorder — whether macOS permissions
are granted (see [Troubleshooting](/reference/troubleshooting)).

## Where things live

See [Architecture](/developer/architecture) for the full repo map. Quick
pointers:

- Recorder UI & capture → `apps/desktop/src`
- Dashboard, recording/screenshot pages, API → `apps/web/app`
- Backend libs (auth, db, r2, quota) → `apps/web/lib`
- Shared types/UI/quota → `packages/*`
