# Point the Chrome extension at your backend

The Chrome Web Store build of the extension only talks to `captureflow.dev`. To
record against your own deployment, build the extension with your domain baked
in and install that copy instead.

## Build it

`WXT_WEB_BASE` sets the backend the extension uploads to and the only site it
accepts sign-in from. For a deployment at `https://rec.example.com`:

```bash
WXT_WEB_BASE=https://rec.example.com pnpm --filter @captureflow/extension build
```

The unpacked extension lands in `apps/extension/.output/chrome-mv3`. To get a
zip for the Chrome Web Store instead, run the same command with `zip` in place
of `build`.

## Install it for your team

Pick one:

- **Chrome Web Store, private.** Upload the zip as a new item and set its
  visibility to your Google Workspace domain. Your team installs it from the
  store and gets updates automatically.
- **Managed install.** Force-install the store item for everyone through the
  Google Workspace admin console (Devices → Chrome → Apps & extensions).
- **Load unpacked.** For a quick trial, open `chrome://extensions`, turn on
  Developer mode, and load `apps/extension/.output/chrome-mv3`.

## Tell the backend its id

The backend only hands a sign-in token to one extension id. Copy your
extension's id from `chrome://extensions` (or the store listing) and set it as a
var in `apps/web/wrangler.jsonc`, then redeploy:

```jsonc
"CAPTUREFLOW_EXTENSION_ID": "<your extension id>"
```

An unpacked build gets an id derived from its folder path, so it changes if you
move the folder. A store item keeps one id for good, which makes it the better
choice for a team.

## Send people to your copy

The dashboard's record buttons link people who don't have the extension yet to
the public CaptureFlow listing. Point them at yours by setting
`NEXT_PUBLIC_CHROME_WEBSTORE_URL` in the build environment before
`pnpm --filter @captureflow/web cf:deploy`.
