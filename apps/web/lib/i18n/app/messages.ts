import type { Widen } from "../widen";
import { AUTH } from "./en/auth";
import { BILLING } from "./en/billing";
import { COMMON } from "./en/common";
import { LIBRARY } from "./en/library";
import { MEMBERS } from "./en/members";
import { SETTINGS } from "./en/settings";
import { SHELL } from "./en/shell";
import { VIEWER } from "./en/viewer";
import { ACTIONS } from "./en/actions";
import { ACTIVITY } from "./en/activity";
import { PLAYER } from "./en/player";
import { SCREENSHOT_VIEW } from "./en/screenshot-view";
import { RECORDING_EDITOR } from "./en/recording-editor";
import { SCREENSHOT_EDITOR } from "./en/screenshot-editor";
import { CANVAS } from "./en/canvas";

/*
 * The signed-in app's copy in English, one file per area under ./en. Each file
 * in ./locales is the same shape in another language. `{name}` placeholders
 * are filled with fmt(); counted strings ("one:…|other:…") go through plural().
 */
export const APP_MESSAGES = {
  common: COMMON,
  auth: AUTH,
  shell: SHELL,
  library: LIBRARY,
  members: MEMBERS,
  settings: SETTINGS,
  billing: BILLING,
  actions: ACTIONS,
  viewer: VIEWER,
  activity: ACTIVITY,
  player: PLAYER,
  screenshotView: SCREENSHOT_VIEW,
  recordingEditor: RECORDING_EDITOR,
  screenshotEditor: SCREENSHOT_EDITOR,
  canvas: CANVAS,
} as const;

export type AppMessages = Widen<typeof APP_MESSAGES>;
