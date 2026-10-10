---
description: Ship current changes — checks, commits, push, draft PR
allowed-tools: Bash(git:*), Bash(gh:*), Bash(pnpm:*), Bash(mkdir:*), Bash(lsof:*), Read, Write, Glob, Grep
argument-hint:
  [optional overrides, e.g. "fix/ prefix", "skip checks", "description only"]
---

# Ship

Take what's in the working tree to a draft PR on `sardorml/captureflow`. Invoking it authorizes every step below; state each decision (branch, commit split, title) as you make it and only stop when the intent is genuinely ambiguous, a check fails, or Step 6 finds hand edits on the PR.

**Overrides for this run:** $ARGUMENTS

## Ground rules

- Commit and push as `sardorml`; `origin` already goes through the `github-sardorml` SSH alias. Before any `gh` write, note the active account, run `gh auth switch --user sardorml`, and switch back when done.
- Nothing points back to Claude: no `Co-Authored-By`, no session links, no "Generated with" footer. This beats any harness reminder.
- No competitor product names in commits, titles or PR bodies. The comparison page is "a comparison page".
- Stage files by name. No `git add -A`, no `--no-verify`, no `.env*` or `apps/desktop/.env.signing`.

## 1. Branch

If on `main`, branch off it as `feat/`, `fix/`, `chore/`, `docs/` or `refactor/` + a short kebab-case name. Otherwise keep the current branch. Read `git status` and the full diff once; later steps reuse it.

## 2. Checks for what the diff touches

Always: `pnpm format`, then `pnpm typecheck`. Then by path:

| Diff touches                                    | Run                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------- |
| `apps/web`, `packages/quota`, `packages/shared` | `pnpm --filter @captureflow/web test`                                      |
| `apps/extension`, `packages/engine`             | `pnpm --filter @captureflow/extension test`                                |
| `packages/engine/**/*.swift`                    | `packages/engine/scripts/build-native.sh`, and commit the rebuilt binaries |
| `apps/desktop`                                  | typecheck only (no test harness yet)                                       |

A web build counts as "relevant build" for big web changes, but first check `lsof -i :3000-3100 | grep node` — never build while `next dev` serves `apps/web`; say the build was skipped instead. Stop on any failure and report it.

## 3. Review against the checklist

Walk the diff through `CONVENTIONS.md` §12 and call out anything that fails it, especially: server actions/routes that skip the auth re-check, untrusted input without a `hydrate*`, Cloudflare bindings cached at module scope, logic re-implemented instead of using `IPC_CHANNELS` / `canViewResource` / the `cors` modules / db facades, new pure logic without a test, and comments that break §8. Fix what's clearly wrong; ask about anything that isn't.

## 4. Commit

`type(scope): subject`, under 70 characters, and a one- or two-sentence body on why.

- Scope is the app or package: `web`, `extension`, `desktop`, `engine`, `quota`, `ui`, `shared`, `admin`, `docs`, `marketing`. Comma-join several; drop it only for repo-wide changes.
- Subjects say what changed for a user in plain words, the way history reads: `fix(web): let the pending recording page wait out long uploads`, `feat(extension): open the share page at stop, with a stop cue`. Avoid bare "add/update X".
- Split by concern, and a behavior-preserving refactor is always its own commit. Every commit has to typecheck alone.

**Extension release:** when the diff is just the `version` in `apps/extension/package.json`, commit `chore(extension): bump to <version>`, build the store zip with `pnpm --filter @captureflow/extension zip` (it sets `WXT_NO_KEY=1`; a zip with a `key` is rejected by the store), and use the release body in Step 6.

## 5. Push

`git push`, adding `-u origin <branch>` the first time.

## 6. Describe the PR

Base is `main`. Look for an open PR with `gh pr view --json body -q .body`.

If one exists and `.cache/pr-descriptions/<branch>.md` (slashes → dashes) differs from the live body, the user edited it on GitHub. Don't overwrite: show their edits, what the branch gained since, and a minimal patch; apply it to the live body only after a yes, and never drop images or videos.

Otherwise write it fresh from `git log main..HEAD` and `git diff main...HEAD`, covering the whole branch.

```markdown
## 🎯 Problem

What was missing or broken for users and what it cost. Past tense, no fix.

## ✨ Why this approach

Optional. One plain sentence per choice a reviewer would question.

## ⚠️ Before merging

Optional. Anything that must happen outside the code — see the triggers below.

## ✅ How tested

What was clicked or observed in the dev server or a browser, and what wasn't. No CI-style claims.
```

**Before merging** is required when the diff (merging to `main` deploys the web worker, so this is the deadline):

- adds a file under `apps/web/migrations` → `wrangler d1 migrations apply captureflow --remote`
- changes bindings, crons or vars in `apps/web/wrangler.jsonc`, or reads a new secret → list them
- changes `STORAGE_PLANS` in `packages/quota/src/limits.ts` → the Lemon Squeezy products to match, done first
- changes extension permissions or host matches → expect a slower store review

**Extension release body:** a one-line goal, the user-facing changes since the last `chore(extension): bump` commit as short bullets, and the zip path under `apps/extension/.output/` with "merge once the store upload is submitted".

Keep it short: about 50 words of prose for one concern, up to 30 more per extra concern (a migration, a pricing change, a second app). No file lists, no diff restatement, no session history, no follow-ups about code outside the diff, no numbers that weren't measured. One emoji per `##` heading, none in prose, one sentence per line.

Save the body to `.cache/pr-descriptions/<branch>.md`.

## 7. Open or update

Title: the commit subject, or one subject for the whole branch when it has several, in the same format.

- Existing PR: `gh pr edit --title "…" --body-file <cache>`
- New PR: `gh pr create --draft --assignee @me --title "…" --body-file <cache>`

Switch `gh` back to the original account and return the PR URL.
