import { BrowserWindow, ipcMain } from "electron";
import {
  IPC_CHANNELS,
  type RecordingAuthState,
  type RecordingConnectivityState,
  type RecordingUsageState,
  type WorkspacesState,
} from "../../shared/types";
import {
  openUpgrade,
  signInToRecordingAccount,
} from "../lib/recording/recording-account-actions";
import {
  clearRecordingAuth,
  getRecordingAuthState,
  onRecordingAuthChange,
} from "../lib/recording/recording-auth";
import {
  getRecordingConnectivity,
  onRecordingConnectivityChange,
} from "../lib/recording/recording-connectivity";
import {
  getRecordingUsage,
  onRecordingUsageChange,
  refreshRecordingUsage,
} from "../lib/recording/recording-usage";
import {
  getWorkspacesState,
  onWorkspacesChange,
  refreshWorkspaces,
  selectWorkspace,
} from "../lib/recording/recording-workspaces";

export function registerRecordingAuthHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.RECORDING_AUTH_GET, (): RecordingAuthState => {
    return getRecordingAuthState();
  });

  ipcMain.handle(
    IPC_CHANNELS.RECORDING_AUTH_SIGN_IN,
    async (): Promise<void> => {
      await signInToRecordingAccount();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RECORDING_AUTH_SIGN_OUT,
    async (): Promise<RecordingAuthState> => {
      return clearRecordingAuth();
    },
  );

  onRecordingAuthChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue;
      win.webContents.send(IPC_CHANNELS.RECORDING_AUTH_CHANGED, state);
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.RECORDING_CONNECTIVITY_GET,
    (): RecordingConnectivityState => {
      return getRecordingConnectivity();
    },
  );

  onRecordingConnectivityChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue;
      win.webContents.send(IPC_CHANNELS.RECORDING_CONNECTIVITY_CHANGED, state);
    }
  });

  ipcMain.handle(IPC_CHANNELS.RECORDING_USAGE_GET, (): RecordingUsageState => {
    return getRecordingUsage();
  });

  // Refreshed on overlay open so a stale cache can't paint the wrong lock affordance.
  ipcMain.handle(
    IPC_CHANNELS.RECORDING_USAGE_REFRESH,
    async (): Promise<RecordingUsageState> => {
      return refreshRecordingUsage();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.RECORDING_USAGE_OPEN_UPGRADE,
    async (): Promise<void> => {
      await openUpgrade();
    },
  );

  onRecordingUsageChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue;
      win.webContents.send(IPC_CHANNELS.RECORDING_USAGE_CHANGED, state);
    }
  });

  // Auth flips swap the cap's scope (account vs. per-device), so refresh on sign-in/out.
  onRecordingAuthChange(() => {
    void refreshRecordingUsage();
    void refreshWorkspaces();
  });

  ipcMain.handle(IPC_CHANNELS.WORKSPACES_GET, (): WorkspacesState => {
    return getWorkspacesState();
  });

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACES_REFRESH,
    async (): Promise<WorkspacesState> => {
      return refreshWorkspaces();
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACES_SELECT,
    async (_evt, id: string): Promise<WorkspacesState> => {
      if (typeof id !== "string" || !id) return getWorkspacesState();
      return selectWorkspace(id);
    },
  );

  onWorkspacesChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue;
      win.webContents.send(IPC_CHANNELS.WORKSPACES_CHANGED, state);
    }
  });
}
