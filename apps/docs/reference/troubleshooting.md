# Troubleshooting

## Recorder (macOS)

**The screen is black or capture won't start.**
Grant **Screen & System Audio Recording** under System Settings → Privacy &
Security, then relaunch CaptureFlow. If the toggle is already on but capture
fails, switch it off and on again (a known macOS quirk) and restart the app.

**The cursor isn't tracked / hotkeys don't fire.**
Enable **Accessibility** for CaptureFlow in Privacy & Security.

**No webcam or no microphone.**
Grant **Camera** / **Microphone** permission, then re-select the device in the
toolbar's device selector.

**Sign-in doesn't return to the app.**
Sign-in completes in the browser and returns via a `captureflow://` deep link.
Make sure your default browser can open the link, and that your backend's
`APP_DEEP_LINK_SCHEME` matches the scheme the app registers (`captureflow`).

## Uploads & share links

**The share link 404s or the video won't play.**
The page metadata comes from D1 but the video/poster are served from R2 over your
CDN domain. Confirm:

- `cdn.captureflow.xyz` (or your equivalent) is bound to the
  `captureflow-recordings` bucket's public access, and
- `R2_PUBLIC_BASE_URL` matches that host.

**A recording is stuck "processing" or never finalized.**
Abandoned multipart uploads are cleaned up by the hourly GC cron. Re-record if
the upload was interrupted (e.g. the app quit mid-recording).

## Self-hosting

**Login fails immediately after deploy.**
`BETTER_AUTH_SECRET` is almost certainly missing. Set it and redeploy:

```bash
openssl rand -hex 32 | pnpm --filter @captureflow/web exec wrangler secret put BETTER_AUTH_SECRET
```

**Auth/session URLs are wrong.**
Check `BETTER_AUTH_URL` and the `NEXT_PUBLIC_*` site URLs in `wrangler.jsonc`
match the domain you actually deployed to.

**Invite emails aren't sending.**
Email is optional. Without `RESEND_API_KEY`, invite sends are skipped — invite
links can still be copied and shared manually.

**See what the Worker is doing:**

```bash
pnpm --filter @captureflow/web exec wrangler tail captureflow-web
```

## Still stuck?

Open an issue on
[GitHub](https://github.com/sardorml/captureflow/issues) with your OS/version,
steps to reproduce, and relevant `wrangler tail` output.
