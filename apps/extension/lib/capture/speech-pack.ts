/*
 * Chrome's on-device speech pack (Chrome 139+). `available()` answers
 * available | downloadable | downloading | unavailable for a language;
 * `install()` downloads the pack (about 45 s in Chrome 155, no user gesture
 * needed). The popup asks for it ahead of the first recording so transcripts
 * stop depending on the cloud recognizer. Brave reports "downloading" and
 * never finishes, and blocks the cloud path too, so it gets no transcripts.
 */

type SpeechPackOptions = { langs: string[]; processLocally: boolean };
type SpeechPackApi = {
  available?: (options: SpeechPackOptions) => Promise<string>;
  install?: (options: SpeechPackOptions) => Promise<boolean>;
};

function speechPackApi(): SpeechPackApi | null {
  const scope = globalThis as unknown as {
    SpeechRecognition?: SpeechPackApi;
    webkitSpeechRecognition?: SpeechPackApi;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

// Brave exposes `navigator.brave`; it blocks the cloud recognizer and never
// finishes the pack download, so a mic recording there yields no transcript.
export function isBraveBrowser(): boolean {
  return "brave" in navigator;
}

export type SpeechPackStatus =
  | "available"
  | "downloadable"
  | "downloading"
  | "unavailable"
  | "unsupported";

export async function speechPackStatus(
  lang: string,
): Promise<SpeechPackStatus> {
  const api = speechPackApi();
  if (!api?.available) return "unsupported";
  try {
    const status = await api.available({ langs: [lang], processLocally: true });
    if (
      status === "available" ||
      status === "downloadable" ||
      status === "downloading"
    ) {
      return status;
    }
  } catch {
    // Fall through: the probe itself failing means no pack.
  }
  return "unavailable";
}

// Resolves once the pack is in (or immediately when it already is / can't be).
export async function ensureSpeechPack(
  lang: string,
): Promise<SpeechPackStatus> {
  const status = await speechPackStatus(lang);
  if (status !== "downloadable") return status;
  const api = speechPackApi();
  try {
    const installed = await api?.install?.({
      langs: [lang],
      processLocally: true,
    });
    return installed ? "available" : "unavailable";
  } catch {
    return "unavailable";
  }
}
