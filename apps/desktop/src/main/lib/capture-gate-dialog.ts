import { dialog, ipcMain, nativeImage } from "electron";
import captureflowIconPath from "../../../resources/icon.png?asset";
import { IPC_CHANNELS, type UpgradeReason } from "../../shared/types";
import {
  openAccountDashboard,
  openUpgrade,
  signInToRecordingAccount,
} from "./recording/recording-account-actions";
import { getRecordingAuthState } from "./recording/recording-auth";
import { logInfo } from "./logger";

const REASON_MESSAGE: Record<UpgradeReason, string> = {
  recording: "Sign in to share",
  screenshot: "Sign in to share screenshots",
  cloud: "Sign in to use cloud sharing",
};

ipcMain.handle(
  IPC_CHANNELS.CAPTURE_GATE_OPEN,
  async (_event, reason: UpgradeReason) => {
    const signedIn = getRecordingAuthState().kind === "signed_in";
    const message = REASON_MESSAGE[reason] ?? REASON_MESSAGE.cloud;

    // Button index 0 = Upgrade (primary), 1 = secondary (sign-in or dashboard),
    // 2 = Cancel. Keep the order in sync with the response routing below.
    const secondary = signedIn ? "Open dashboard" : "Sign in";
    const detail = signedIn
      ? "Upgrade to Pro to unlock this, or open your dashboard to manage your account."
      : "Sign in to your CaptureFlow account and upgrade to Pro to unlock this feature.";

    const options = {
      type: "info" as const,
      icon: nativeImage.createFromPath(captureflowIconPath),
      title: "CaptureFlow Pro",
      message,
      detail,
      buttons: ["Upgrade to Pro", secondary, "Cancel"],
      defaultId: 0,
      cancelId: 2,
      noLink: true,
    };
    // Freestanding (no parent): sheeting it onto the transparent toolbar window breaks the dialog.
    const { response } = await dialog.showMessageBox(options);

    logInfo(
      "capture-gate",
      `reason=${reason} signedIn=${signedIn} response=${response}`,
    );

    if (response === 0) {
      await openUpgrade();
    } else if (response === 1) {
      if (signedIn) await openAccountDashboard();
      else await signInToRecordingAccount();
    }
  },
);
