import { shell } from "electron";
import { hostname } from "os";

// Override at dev time, e.g. CAPTUREFLOW_APP_WEB_BASE=http://localhost:3032.
const APP_WEB_BASE =
  process.env.CAPTUREFLOW_APP_WEB_BASE ?? "https://captureflow.xyz";

/** Open the browser at the device-token sign-in page. */
export async function signInToRecordingAccount(): Promise<void> {
  let label = "";
  try {
    label = hostname();
  } catch {
    label = "";
  }
  const url = new URL(`${APP_WEB_BASE}/auth/callback`);
  if (label) url.searchParams.set("label", label);
  await shell.openExternal(url.toString());
}

/** Open the pricing page, where the user picks a plan and checks out. */
export async function openUpgrade(): Promise<void> {
  await shell.openExternal(`${APP_WEB_BASE}/plan`);
}

/** Open the captureflow.xyz dashboard (Recordings is the signed-in home). */
export async function openAccountDashboard(): Promise<void> {
  await shell.openExternal(`${APP_WEB_BASE}/recordings`);
}
