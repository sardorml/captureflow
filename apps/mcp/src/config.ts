import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export const DEFAULT_URL = "https://captureflow.dev";

export type TtsSettings = {
  provider: "kokoro" | "system" | "openai";
  url: string | null;
  model: string | null;
  key: string | null;
  voice: string | null;
};

export type Settings = {
  url: string;
  headless: boolean;
  viewport: { width: number; height: number };
  saveDir: string | null;
  ffmpeg: string | null;
  tts: TtsSettings;
};

export type Credentials = { token: string; tokenId: string; deviceId: string };

type Env = Record<string, string | undefined>;

export function configDir(
  env: Env = process.env,
  platform: NodeJS.Platform = process.platform,
  home = homedir(),
): string {
  if (env.CAPTUREFLOW_HOME) return env.CAPTUREFLOW_HOME;
  if (platform === "win32") {
    return join(env.APPDATA ?? join(home, "AppData", "Roaming"), "CaptureFlow");
  }
  return join(env.XDG_CONFIG_HOME ?? join(home, ".config"), "captureflow");
}

function flag(argv: string[], name: string): string | null {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return null;
  const next = argv[i + 1];
  return next && !next.startsWith("--") ? next : "";
}

function parseViewport(raw: string | undefined) {
  const m = /^(\d{3,4})x(\d{3,4})$/.exec(raw ?? "");
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
}

// Flags win over environment variables, which win over the defaults.
export function readSettings(argv: string[], env: Env = process.env): Settings {
  const url = (flag(argv, "url") || env.CAPTUREFLOW_URL || DEFAULT_URL).replace(
    /\/+$/,
    "",
  );
  // Hidden unless asked: the agent records while the user keeps using their computer.
  const headless =
    flag(argv, "show-browser") === null && env.CAPTUREFLOW_SHOW_BROWSER !== "1";
  const saveDir = flag(argv, "save-dir") || env.CAPTUREFLOW_SAVE_DIR || null;
  const ttsUrl = env.CAPTUREFLOW_TTS_URL || null;
  const provider = env.CAPTUREFLOW_TTS;
  return {
    url,
    headless,
    viewport: parseViewport(env.CAPTUREFLOW_VIEWPORT) ?? {
      width: 1920,
      height: 1080,
    },
    saveDir,
    ffmpeg: env.CAPTUREFLOW_FFMPEG || null,
    tts: {
      provider:
        provider === "system" || provider === "openai" || provider === "kokoro"
          ? provider
          : ttsUrl
            ? "openai"
            : "kokoro",
      url: ttsUrl,
      model: env.CAPTUREFLOW_TTS_MODEL || null,
      key: env.CAPTUREFLOW_TTS_KEY || null,
      voice: env.CAPTUREFLOW_TTS_VOICE || null,
    },
  };
}

export function hydrateCredentials(raw: unknown): Credentials | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (
    typeof r.token !== "string" ||
    r.token.length < 32 ||
    typeof r.tokenId !== "string" ||
    typeof r.deviceId !== "string" ||
    r.deviceId.length < 8 ||
    r.deviceId.length > 64
  ) {
    return null;
  }
  return { token: r.token, tokenId: r.tokenId, deviceId: r.deviceId };
}

const credentialsPath = () => join(configDir(), "credentials.json");

// One sign-in per server, so a dev server's token never goes to production.
async function readAll(): Promise<Record<string, unknown>> {
  try {
    const parsed: unknown = JSON.parse(
      await readFile(credentialsPath(), "utf8"),
    );
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

async function writeAll(all: Record<string, unknown>) {
  await mkdir(configDir(), { recursive: true });
  await writeFile(credentialsPath(), JSON.stringify(all, null, 2), {
    mode: 0o600,
  });
  await chmod(credentialsPath(), 0o600).catch(() => {});
}

export async function loadCredentials(url: string) {
  return hydrateCredentials((await readAll())[url]);
}

export async function saveCredentials(url: string, creds: Credentials) {
  await writeAll({ ...(await readAll()), [url]: creds });
}

export async function clearCredentials(url: string) {
  const { [url]: _gone, ...rest } = await readAll();
  await writeAll(rest);
}
