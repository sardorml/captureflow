// The DOM lib has no types for Document Picture-in-Picture yet.
type DocumentPictureInPicture = {
  requestWindow(options: {
    width: number;
    height: number;
    disallowReturnToOpener?: boolean;
  }): Promise<Window>;
};

export const RECORDING_BUBBLE_SIZE = 220;
const PADDING = 12;
const NOTE_HEIGHT = 28;

// The bubble with a little room around it and a line of text under it;
// Chrome widens a window it finds too small.
export function recordingWindowSize(): { width: number; height: number } {
  const width = PADDING * 2 + RECORDING_BUBBLE_SIZE;
  return { width, height: width + NOTE_HEIGHT };
}

/*
 * A Document Picture-in-Picture window floats over the page without being
 * part of the tab, so tab capture never records what it shows. Opening one
 * needs a user gesture: this runs off the panel's Start press, relayed by the
 * worker while that activation is still fresh. Null when the browser has no
 * such window or the gesture has lapsed.
 */
export async function requestRecordingWindow(): Promise<Window | null> {
  const api = (
    window as Window & { documentPictureInPicture?: DocumentPictureInPicture }
  ).documentPictureInPicture;
  if (!api) return null;
  try {
    return await api.requestWindow({
      ...recordingWindowSize(),
      disallowReturnToOpener: true,
    });
  } catch {
    return null;
  }
}
