import type { TranscriptSource } from "../api/types";
import { ensureSpeechPack, speechPackStatus } from "./speech-pack";
import type { Utterance } from "./transcript-timeline";

/*
 * Live transcription over Chrome's Web Speech API, fed the recording's mic
 * track. On-device recognition is used when the language pack is installed
 * (Chrome 139+, `processLocally`); otherwise Chrome's cloud recognizer. The
 * API has no TypeScript types, so the shape used here is declared below.
 */

type RecognitionAlternative = { transcript: string };
type RecognitionResult = ArrayLike<RecognitionAlternative> & {
  isFinal: boolean;
};
type RecognitionEvent = {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
};
type RecognitionErrorEvent = { error: string };

type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  processLocally: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: RecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start(track?: MediaStreamTrack): void;
  stop(): void;
};

type RecognitionCtor = { new (): Recognition };

export type Transcriber = {
  source: TranscriptSource;
  language: string;
  // Resolves with everything recognized so far once the recognizer has ended.
  stop(): Promise<Utterance[]>;
};

type StartArgs = {
  track: MediaStreamTrack;
  lang: string;
  log?: (message: string) => void;
};

// Errors after which the recognizer stays down for this recording.
const FATAL_ERRORS = new Set([
  "not-allowed",
  "service-not-allowed",
  "language-not-supported",
  "audio-capture",
]);
const MAX_FAILED_RESTARTS = 5;
const STOP_TIMEOUT_MS = 2_000;

function recognitionCtor(): RecognitionCtor | null {
  const scope = globalThis as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return scope.SpeechRecognition ?? scope.webkitSpeechRecognition ?? null;
}

export async function startTranscriber({
  track,
  lang,
  log,
}: StartArgs): Promise<Transcriber | null> {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const pack = await speechPackStatus(lang);
  const local = pack === "available";
  // A missing pack downloads for next time; this recording uses the cloud
  // recognizer meanwhile.
  if (pack === "downloadable") void ensureSpeechPack(lang);
  log?.(
    `speech recognition: ${local ? "on-device" : "cloud"} (${lang}, pack ${pack})`,
  );

  const utterances: Utterance[] = [];
  let running = true;
  let current: Recognition | null = null;
  let firstInterimAt: number | null = null;
  let lastError: string | null = null;
  let failedRestarts = 0;
  let onStopped: (() => void) | null = null;

  const begin = (): void => {
    const rec = new Ctor();
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    if (local) rec.processLocally = true;

    rec.onstart = () => {
      lastError = null;
    };
    rec.onresult = (event) => {
      const now = Date.now();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result?.[0]?.transcript?.trim() ?? "";
        if (!result) continue;
        if (result.isFinal) {
          if (text) {
            utterances.push({
              firstInterimAt: firstInterimAt ?? now,
              finalAt: now,
              text,
            });
            failedRestarts = 0;
          }
          firstInterimAt = null;
        } else if (firstInterimAt === null && text) {
          firstInterimAt = now;
        }
      }
    };
    rec.onerror = (event) => {
      lastError = event.error;
      log?.(`speech recognition error: ${event.error}`);
      if (FATAL_ERRORS.has(event.error)) running = false;
    };
    // Cloud recognition ends on its own every minute or so; errors end it
    // too. Either way the session restarts until the recording stops.
    rec.onend = () => {
      current = null;
      firstInterimAt = null;
      if (!running) {
        onStopped?.();
        return;
      }
      let delay = 0;
      if (lastError && lastError !== "no-speech") {
        failedRestarts++;
        if (failedRestarts > MAX_FAILED_RESTARTS) {
          running = false;
          log?.("speech recognition gave up after repeated errors");
          return;
        }
        delay = Math.min(250 * 2 ** (failedRestarts - 1), 4_000);
      }
      setTimeout(() => {
        if (running) begin();
      }, delay);
    };

    try {
      rec.start(track);
      current = rec;
    } catch (err) {
      running = false;
      log?.(`speech recognition failed to start: ${String(err)}`);
    }
  };

  begin();
  if (!running) return null;

  return {
    source: local ? "chrome-speech-local" : "chrome-speech-cloud",
    language: lang,
    stop: () =>
      new Promise<Utterance[]>((resolve) => {
        running = false;
        const rec = current;
        if (!rec) {
          resolve(utterances);
          return;
        }
        const done = (): void => resolve(utterances);
        onStopped = done;
        setTimeout(done, STOP_TIMEOUT_MS);
        try {
          rec.stop();
        } catch {
          done();
        }
      }),
  };
}
