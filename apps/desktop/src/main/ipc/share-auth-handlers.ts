import { BrowserWindow, ipcMain } from 'electron'
import {
  IPC_CHANNELS,
  type ShareAuthState,
  type ShareConnectivityState,
  type ShareUsageState,
  type WorkspacesState
} from '../../shared/types'
import { openUpgrade, signInToShareAccount } from '../lib/share/share-account-actions'
import { clearShareAuth, getShareAuthState, onShareAuthChange } from '../lib/share/share-auth'
import { getShareConnectivity, onShareConnectivityChange } from '../lib/share/share-connectivity'
import { getShareUsage, onShareUsageChange, refreshShareUsage } from '../lib/share/share-usage'
import {
  getWorkspacesState,
  onWorkspacesChange,
  refreshWorkspaces,
  selectWorkspace
} from '../lib/share/share-workspaces'

export function registerShareAuthHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.SHARE_AUTH_GET, (): ShareAuthState => {
    return getShareAuthState()
  })

  ipcMain.handle(IPC_CHANNELS.SHARE_AUTH_SIGN_IN, async (): Promise<void> => {
    await signInToShareAccount()
  })

  ipcMain.handle(IPC_CHANNELS.SHARE_AUTH_SIGN_OUT, async (): Promise<ShareAuthState> => {
    return clearShareAuth()
  })

  // Fan-out to every BrowserWindow on state change. No diffing — subscribers
  // are tiny, so a per-event broadcast is cheap.
  onShareAuthChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue
      win.webContents.send(IPC_CHANNELS.SHARE_AUTH_CHANGED, state)
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHARE_CONNECTIVITY_GET, (): ShareConnectivityState => {
    return getShareConnectivity()
  })

  onShareConnectivityChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue
      win.webContents.send(IPC_CHANNELS.SHARE_CONNECTIVITY_CHANGED, state)
    }
  })

  ipcMain.handle(IPC_CHANNELS.SHARE_USAGE_GET, (): ShareUsageState => {
    return getShareUsage()
  })

  // The selection overlay calls this on open so a stale cached state can't
  // paint the wrong lock affordance.
  ipcMain.handle(IPC_CHANNELS.SHARE_USAGE_REFRESH, async (): Promise<ShareUsageState> => {
    return refreshShareUsage()
  })

  ipcMain.handle(IPC_CHANNELS.SHARE_USAGE_OPEN_UPGRADE, async (): Promise<void> => {
    await openUpgrade()
  })

  onShareUsageChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue
      win.webContents.send(IPC_CHANNELS.SHARE_USAGE_CHANGED, state)
    }
  })

  // Auth flips swap the cap's scope (account vs. per-device) and a different
  // user has entirely different numbers — refresh so the cached snapshot
  // doesn't outlive a sign-in/sign-out cycle.
  onShareAuthChange(() => {
    void refreshShareUsage()
    void refreshWorkspaces()
  })

  ipcMain.handle(IPC_CHANNELS.WORKSPACES_GET, (): WorkspacesState => {
    return getWorkspacesState()
  })

  ipcMain.handle(IPC_CHANNELS.WORKSPACES_REFRESH, async (): Promise<WorkspacesState> => {
    return refreshWorkspaces()
  })

  ipcMain.handle(
    IPC_CHANNELS.WORKSPACES_SELECT,
    async (_evt, id: string): Promise<WorkspacesState> => {
      if (typeof id !== 'string' || !id) return getWorkspacesState()
      return selectWorkspace(id)
    }
  )

  onWorkspacesChange((state) => {
    for (const win of BrowserWindow.getAllWindows()) {
      if (win.isDestroyed()) continue
      win.webContents.send(IPC_CHANNELS.WORKSPACES_CHANGED, state)
    }
  })
}
