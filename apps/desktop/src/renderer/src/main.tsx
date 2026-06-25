/* eslint-disable react-refresh/only-export-components */
import "./assets/main.css";
import "material-symbols/rounded.css";
import "./stores/theme-store";
import { bootEntitlementStore } from "./stores/entitlement-store";
import {
  initAnalytics,
  setAnalyticsEnabled,
  setAnalyticsIdentity,
  track,
} from "./lib/analytics";
import type { RecordingAuthState } from "../../shared/types";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { PermissionDialogWindow } from "./components/permissions/PermissionDialogWindow";
import { RecordingFailureModal } from "./components/recording/RecordingFailureModal";

bootEntitlementStore();

const params = new URLSearchParams(window.location.search);
const view = params.get("view");

// `app_opened` fires only from the main toolbar window to avoid one event per
// BrowserWindow.
const isMainToolbar =
  !view && (window.location.hash === "" || window.location.hash === "#/");
void (async (): Promise<void> => {
  try {
    let latestAuth: RecordingAuthState = { kind: "signed_out" };
    const [prefs, auth] = await Promise.all([
      window.electronAPI.getUserPrefs(),
      window.electronAPI.getRecordingAuth(),
    ]);
    latestAuth = auth;
    initAnalytics({ enabled: prefs.analyticsEnabled, auth });
    window.electronAPI.onUserPrefsChanged((p) =>
      setAnalyticsEnabled(p.analyticsEnabled, latestAuth),
    );
    window.electronAPI.onRecordingAuthChanged((s) => {
      latestAuth = s;
      setAnalyticsIdentity(s);
    });
    if (isMainToolbar) track("app_opened");
  } catch {
    // Analytics must never block the app.
  }
})();

const TRANSPARENT_VIEWS = new Set(["recording-failure"]);
const TRANSPARENT_HASHES = new Set([
  "",
  "#/",
  "#/selection-overlay",
  "#/webcam-bubble",
  "#/screenshot-notification",
]);
const isTransparent =
  (view && TRANSPARENT_VIEWS.has(view)) ||
  (!view && TRANSPARENT_HASHES.has(window.location.hash));
if (isTransparent) {
  document.documentElement.style.background = "transparent";
  document.body.style.background = "transparent";
}

function RootApp(): React.JSX.Element {
  if (view === "permission-dialog") return <PermissionDialogWindow />;
  if (view === "recording-failure") return <RecordingFailureModal />;
  return <App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
