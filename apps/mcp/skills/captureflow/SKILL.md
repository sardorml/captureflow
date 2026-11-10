---
name: captureflow
description: Record a demo of the changes on the current branch or pull request, or a reproduction of a bug, with CaptureFlow, and attach the link to the pull request or issue. Use when the user types /captureflow, asks for a demo or walkthrough video of their changes or a pull request, or asks to record a bug, a repro or a fix.
---

# CaptureFlow demo

Turns code changes or a bug into a short video a reviewer can watch instead of
checking the change out: slides that say what changed, the change itself on
screen, the checks that ran, and the commit it was recorded at. It ends with a
share link, attached to the pull request or issue.

Recording runs through the CaptureFlow MCP server on this computer
(`@captureflow/mcp`). Its tools are named below without a prefix because the
prefix depends on what the user called the server. If only the hosted server
is connected (it has `start_presentation` but no `start_recording`), it cannot
open localhost: make a slides-only walkthrough and say so. If neither is
connected, tell the user to run
`claude mcp add captureflow -- npx -y @captureflow/mcp` and stop.

## What the user can ask for

| Request                                        | What to do                                                                  |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| `/captureflow`                                 | Demo the current branch against its base.                                   |
| `/captureflow <PR number or link>`             | Demo that pull request. Check it out first if it is not the current branch. |
| `/captureflow bug <issue link or description>` | Reproduce the bug and record the steps.                                     |
| `/captureflow fix <recording or issue link>`   | Fix a recorded bug, then demo the fix.                                      |
| `voice` / `no voice`                           | Force narration on or off.                                                  |
| `no slides`                                    | Record only the screen.                                                     |
| `no-attach`                                    | Do not touch the pull request or issue.                                     |

The user's words always win over the defaults here.

## 1. Gather

Run these and keep the results:

```
git rev-parse HEAD
git status --porcelain
git rev-parse --abbrev-ref HEAD
git remote get-url origin
gh pr view --json number,title,url,body,baseRefName,headRefOid,commits
git diff <base>...HEAD --stat
git diff <base>...HEAD
```

- No pull request: use the default branch as the base and leave `url` and
  `number` out.
- `git status --porcelain` not empty: the recording includes uncommitted work.
  Set `dirty: true` and say so in the summary. Do not commit or stash for the user.
- `bug` with an issue link: `gh issue view <link> --json number,title,body,url`.
- `fix` with a recording link: call `get_recording` with its id for the
  summary and chapters, and `get_transcript` for what the reporter said.
  Reproduce it before changing anything, fix it, then continue as a demo with
  `kind: "fix"` and `reproUrl` set to that link.

## 2. Write the brief

Write this JSON before recording. Everything after is driven by it.

```json
{
  "kind": "pr",
  "title": "Workspace name updates after switching",
  "summary": "Two or three plain sentences a reviewer reads first.",
  "source": {
    "repoUrl": "https://github.com/owner/name",
    "url": "https://github.com/owner/name/pull/182",
    "number": 182,
    "branch": "fix/workspace-name",
    "base": "main",
    "sha": "<git rev-parse HEAD>",
    "dirty": false,
    "issueUrl": null,
    "reproUrl": null,
    "commits": [{ "sha": "<sha>", "title": "<subject line>" }]
  },
  "changes": [
    {
      "title": "Settings shows the current workspace",
      "detail": "One sentence on what is different now.",
      "files": ["apps/web/app/settings/page.tsx"],
      "show": {
        "type": "page",
        "url": "http://localhost:3000/settings",
        "steps": ["Switch workspace", "Open settings"]
      },
      "narration": "A sentence or two, used only with voiceover."
    }
  ],
  "checks": [{ "name": "typecheck", "status": "passed", "detail": "" }],
  "notShown": ["Migration 0038 has no visible effect"],
  "voiceover": false
}
```

- `kind`: `pr`, `bug`, `fix` or `feature` (work with no pull request yet).
- One entry in `changes` per thing a reviewer needs to see, in the order they
  should see it. Group files by behaviour, not by folder. Leave out lockfiles,
  formatting and generated files. Six changes is a lot; merge small ones.
- `show.type` is `page` (drive the running app), `code` (a file and line range
  on a code slide) or `screen` (film a terminal or an app window).
- `checks` are checks you actually ran in this session: typecheck, tests,
  build, lint. Run the project's usual ones if you have not. `failed` stays
  `failed`; never leave a failing check out.
- `notShown` lists every change the video does not show, so nobody assumes
  it was covered.
- `voiceover` is true when the user asked for a voice, or when the change
  cannot be followed from the screen alone: behaviour with nothing to see,
  code-only changes, or a flow of more than a few steps. `no voice` wins.

## 3. Record

Plan every slide and step before starting, then move at a pace a viewer can
follow. Pass `voiceover: true` to the start tool when the brief says so, and
then `narrate` after every slide and every step, a sentence or two each.
Without a voice, `wait` 3 to 4 seconds on each slide.

Pick how to start:

- Any `page` change: make sure the app is running (start its dev server the
  way the project documents if it is not, and wait until it answers), then
  `start_recording` with the first `show.url` and the brief's title. If the
  app needs a sign-in you have no test account for, ask the user once.
- Only `code` changes: `start_presentation`.
- Only `screen` changes: `list_screens`, then `start_screen_recording` on the
  terminal or app, and do the work with your own tools while it films.

Then, unless the user said `no slides`:

1. `show_slide` a `cover`: the title, and a subtitle like
   `PR #182 · a1b2c3d` (the first 7 characters of the commit).
2. With two or more changes, a `list` slide with one item per change.
3. For each change, a `feature` slide whose `title` is the change's `title`
   (it becomes that change's chapter), `subtitle` its `detail`. Then show it:
   - `page`: `hide_slide`, `navigate` to `show.url`, do the steps with
     `click`, `type`, `scroll` and `press`, and `look` to confirm the result
     is on screen before moving on.
   - `code`: a `code` slide with the lines that changed, at most 18 lines,
     and `lines` set to the ones that matter.
   - `screen`: `hide_slide`, run the command, `wait` for the output.
4. A closing `statement` slide: what works now, and the checks in a few
   words ("Typecheck and 212 tests pass").

For a bug (`kind: "bug"`): cover `Bug: <short title>`, then the reproduction
live with no slide over it, one step at a time, stopping on the broken result
for 3 seconds. Close with a `statement` slide: what you expected and what
happened instead. If you cannot reproduce it, do not record; tell the user
what you tried.

`stop_recording`. Keep the link, the duration and the chapters it returns.

## 4. Report

Call `create_report` with:

- `recording`: the link.
- `summary`: the brief's summary as plain text. No Markdown.
- `context`: the brief's `source` (`url`, `branch`, `sha`, `dirty`,
  `issueUrl` and `reproUrl` only), `changes` (title and detail only), `checks`
  and `notShown`.

The context is added to the summary, so the recording's page shows the commit,
the pull request or issue, the changes, the checks and what was not shown
above the video.

## 5. Attach

Skip this with `no-attach`, or when there is no pull request or issue.

```
<!-- captureflow:demo -->
### Demo

<link>

Recorded at `<short sha>` · <UTC date and time> · <duration>
<!-- /captureflow:demo -->
```

Add `, with uncommitted changes` after the commit when `dirty` is true.

- Pull request: read the body from `gh pr view --json body`. Replace an
  existing `<!-- captureflow:demo -->` block, or add the block at the end, and
  write it back with `gh pr edit <number> --body-file <file>`. Change nothing
  else in the description.
- Bug: `gh issue comment <link> --body-file <file>` with the block, the
  steps as a numbered list and expected versus actual.

Never change the recording's visibility. Recordings keep the workspace's
default, and the summary is visible to whoever can open the link.

## 6. Tell the user

Give the link, the duration, the commit it was recorded at, the checks with
any failure first, what was not shown, and whether the pull request or issue
was updated.
