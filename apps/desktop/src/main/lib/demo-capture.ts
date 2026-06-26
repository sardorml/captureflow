// CaptureFlow's recording chrome (controls bar, dim, camera bubble) is
// content-protected by default so it never leaks into a user's own screen
// recordings, shares, or screenshots. Set CAPTUREFLOW_DEMO_CAPTURE_UI=1 to leave
// it capturable — used when screen-recording CaptureFlow itself for demos.
// The app's own recordings stay clean regardless, via the native recorder's
// excludePid filter.
export function shouldProtectCaptureChrome(): boolean {
  return process.env.CAPTUREFLOW_DEMO_CAPTURE_UI !== "1";
}
