// The DOM lib has no types for Document Picture-in-Picture yet.
type DocumentPictureInPicture = {
  requestWindow(options: {
    width: number;
    height: number;
    disallowReturnToOpener?: boolean;
  }): Promise<Window>;
};

export const RECORDING_BUBBLE_SIZE = 220;
const BAR_WIDTH = 58;
const BAR_HEIGHT = 230;
const GAP = 12;
const PADDING = 12;

// The bar beside the bubble, or the bar on its own. Chrome widens a window it
// finds too small.
export function recordingWindowSize(camera: boolean): {
  width: number;
  height: number;
} {
  const width =
    PADDING * 2 + BAR_WIDTH + (camera ? GAP + RECORDING_BUBBLE_SIZE : 0);
  const height = PADDING * 2 + (camera ? RECORDING_BUBBLE_SIZE : BAR_HEIGHT);
  return { width, height };
}

/*
 * A Document Picture-in-Picture window floats over the page without being
 * part of the tab, so tab capture never records what it shows. Opening one
 * needs a user gesture: this runs off the panel's Start press, relayed by the
 * worker while that activation is still fresh. Null when the browser has no
 * such window or the gesture has lapsed.
 */
export async function requestRecordingWindow(
  camera: boolean,
): Promise<Window | null> {
  const api = (
    window as Window & { documentPictureInPicture?: DocumentPictureInPicture }
  ).documentPictureInPicture;
  if (!api) return null;
  try {
    return await api.requestWindow({
      ...recordingWindowSize(camera),
      disallowReturnToOpener: true,
    });
  } catch {
    return null;
  }
}
