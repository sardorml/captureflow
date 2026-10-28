type WhisperInput = { audio: string; language?: string };

type Word = { word: string; start: number; end: number };
type Segment = { start: number; end: number; text: string; words?: Word[] };

export type WhisperOptions = {
  baseUrl: string;
  apiKey?: string;
  model: string;
  fetcher?: typeof fetch;
};

/*
 * Stands in for the Workers AI binding's Whisper model by calling an
 * OpenAI-compatible /v1/audio/transcriptions endpoint (a local
 * faster-whisper server, OpenAI, Groq…). OpenAI returns words beside the
 * segments rather than inside them, so they're folded back in to match the
 * Workers AI output the app parses.
 */
export function createWhisperAi(options: WhisperOptions): Ai {
  const endpoint = `${options.baseUrl.replace(/\/+$/, "")}/v1/audio/transcriptions`;
  const fetcher = options.fetcher ?? fetch;

  async function run(_model: string, input: WhisperInput) {
    const form = new FormData();
    form.set(
      "file",
      new Blob([Buffer.from(input.audio, "base64")]),
      "audio.webm",
    );
    form.set("model", options.model);
    form.set("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "segment");
    form.append("timestamp_granularities[]", "word");
    if (input.language) form.set("language", input.language);

    const res = await fetcher(endpoint, {
      method: "POST",
      headers: options.apiKey
        ? { authorization: `Bearer ${options.apiKey}` }
        : {},
      body: form,
    });
    if (!res.ok) {
      throw new Error(
        `whisper ${res.status}: ${(await res.text()).slice(0, 200)}`,
      );
    }
    return toWorkersAiOutput(await res.json());
  }

  return { run } as unknown as Ai;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTimed(value: unknown): value is { start: number; end: number } {
  return (
    isRecord(value) &&
    typeof value.start === "number" &&
    typeof value.end === "number"
  );
}

export function toWorkersAiOutput(raw: unknown): {
  text: string;
  segments: Segment[];
} {
  if (!isRecord(raw)) return { text: "", segments: [] };
  const text = typeof raw.text === "string" ? raw.text : "";
  const words: Word[] = Array.isArray(raw.words)
    ? raw.words.filter(
        (w): w is Word => isTimed(w) && typeof (w as Word).word === "string",
      )
    : [];
  const segments: Segment[] = (Array.isArray(raw.segments) ? raw.segments : [])
    .filter(isTimed)
    .map((s) => {
      const segment = s as Record<string, unknown> & Segment;
      const own = Array.isArray(segment.words) ? segment.words : undefined;
      return {
        start: segment.start,
        end: segment.end,
        text: typeof segment.text === "string" ? segment.text : "",
        words:
          own ??
          words.filter(
            (w) => w.start >= segment.start && w.start < segment.end,
          ),
      };
    });
  if (segments.length === 0 && words.length > 0) {
    segments.push({
      start: words[0]!.start,
      end: words[words.length - 1]!.end,
      text,
      words,
    });
  }
  return { text, segments };
}
