import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { decodeAudio, SessionError } from "@captureflow/agent-recorder";
import type { TtsSettings } from "./config";
import { ensurePackage, importInstalled } from "./runtime";

const KOKORO_VERSION = "1.2.1";
const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

export const KOKORO_VOICES = [
  "af_heart",
  "af_bella",
  "af_nicole",
  "af_sarah",
  "af_sky",
  "am_michael",
  "am_adam",
  "am_fenrir",
  "am_puck",
  "bf_emma",
  "bf_isabella",
  "bm_george",
  "bm_lewis",
  "bm_fable",
] as const;

type KokoroModule = {
  KokoroTTS: {
    from_pretrained(
      model: string,
      opts: { dtype: "q8"; device: "cpu" },
    ): Promise<{
      generate(
        text: string,
        opts: { voice: string },
      ): Promise<{ toWav(): ArrayBuffer }>;
    }>;
  };
};

let kokoro: ReturnType<typeof loadKokoro> | null = null;

function loadKokoro() {
  return (async () => {
    const dir = await ensurePackage("kokoro-js", KOKORO_VERSION);
    const mod = await importInstalled<KokoroModule>(dir, "kokoro-js");
    return mod.KokoroTTS.from_pretrained(KOKORO_MODEL, {
      dtype: "q8",
      device: "cpu",
    });
  })();
}

// The first narration downloads the runtime and the ~90 MB model; starting early hides most of that.
export function warmVoice(tts: TtsSettings): void {
  if (tts.provider !== "kokoro") return;
  kokoro ??= loadKokoro();
  kokoro.catch(() => (kokoro = null));
}

async function withTemp<T>(work: (dir: string) => Promise<T>): Promise<T> {
  const dir = await mkdtemp(join(tmpdir(), "captureflow-voice-"));
  try {
    return await work(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function exec(
  cmd: string,
  args: string[],
  env?: NodeJS.ProcessEnv,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: ["ignore", "ignore", "pipe"],
      env: { ...process.env, ...env },
    });
    let stderr = "";
    child.stderr.on(
      "data",
      (c: Buffer) => (stderr = (stderr + c).slice(-1000)),
    );
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} exited ${code}: ${stderr}`)),
    );
  });
}

// The voice the operating system ships: macOS `say`, Windows' speech synthesizer, espeak-ng on Linux.
async function systemSpeech(
  text: string,
  voice: string | null,
): Promise<Uint8Array> {
  return withTemp(async (dir) => {
    const input = join(dir, "text.txt");
    await writeFile(input, text);
    if (process.platform === "darwin") {
      const out = join(dir, "speech.aiff");
      await exec("say", [
        ...(voice ? ["-v", voice] : []),
        "-f",
        input,
        "-o",
        out,
      ]);
      return readFile(out);
    }
    if (process.platform === "win32") {
      const out = join(dir, "speech.wav");
      await exec(
        "powershell",
        [
          "-NoProfile",
          "-NonInteractive",
          "-Command",
          "Add-Type -AssemblyName System.Speech; $s = New-Object System.Speech.Synthesis.SpeechSynthesizer; if ($env:CF_VOICE) { $s.SelectVoice($env:CF_VOICE) }; $s.SetOutputToWaveFile($env:CF_OUT); $s.Speak([IO.File]::ReadAllText($env:CF_TEXT)); $s.Dispose()",
        ],
        { CF_OUT: out, CF_TEXT: input, CF_VOICE: voice ?? "" },
      );
      return readFile(out);
    }
    const out = join(dir, "speech.wav");
    const args = [...(voice ? ["-v", voice] : []), "-f", input, "-w", out];
    await exec("espeak-ng", args).catch(() => exec("espeak", args));
    return readFile(out);
  });
}

// Any server that speaks OpenAI's /audio/speech: OpenAI itself, or Kokoro-FastAPI, Piper and the like running locally.
async function openAiSpeech(
  text: string,
  voice: string | null,
  tts: TtsSettings,
): Promise<Uint8Array> {
  const base = (tts.url ?? "https://api.openai.com/v1").replace(/\/+$/, "");
  const res = await fetch(`${base}/audio/speech`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(tts.key ? { authorization: `Bearer ${tts.key}` } : {}),
    },
    body: JSON.stringify({
      model: tts.model ?? "tts-1",
      voice: voice ?? "alloy",
      input: text,
      response_format: "mp3",
    }),
  });
  if (!res.ok) {
    throw new SessionError(
      `The voice server at ${base} answered ${res.status}: ${(await res.text()).slice(0, 200)}`,
    );
  }
  return new Uint8Array(await res.arrayBuffer());
}

export type Speech = {
  pcm: Int16Array;
  provider: TtsSettings["provider"];
  note?: string;
};

export async function speak(
  text: string,
  voice: string | undefined,
  tts: TtsSettings,
  ffmpeg: string,
): Promise<Speech> {
  const chosen = voice || tts.voice;
  if (tts.provider === "openai") {
    return {
      pcm: await decodeAudio(await openAiSpeech(text, chosen, tts), ffmpeg),
      provider: "openai",
    };
  }
  if (tts.provider === "kokoro") {
    try {
      warmVoice(tts);
      const model = await kokoro!;
      const audio = await model.generate(text, { voice: chosen || "af_heart" });
      return {
        pcm: await decodeAudio(new Uint8Array(audio.toWav()), ffmpeg),
        provider: "kokoro",
      };
    } catch (err) {
      const pcm = await decodeAudio(await systemSpeech(text, null), ffmpeg);
      return {
        pcm,
        provider: "system",
        note: `The Kokoro voice couldn't load (${(err as Error).message.slice(0, 160)}), so this line used the system voice.`,
      };
    }
  }
  return {
    pcm: await decodeAudio(await systemSpeech(text, chosen), ffmpeg),
    provider: "system",
  };
}
