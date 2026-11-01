import { describe, expect, it } from "vitest";
import { configDir, hydrateCredentials, readSettings } from "./config";

describe("readSettings", () => {
  it("defaults to the hosted site, a hidden browser and the Kokoro voice", () => {
    const s = readSettings([], {});
    expect(s.url).toBe("https://captureflow.dev");
    expect(s.headless).toBe(true);
    expect(s.saveDir).toBeNull();
    expect(s.viewport).toEqual({ width: 1920, height: 1080 });
    expect(s.tts.provider).toBe("kokoro");
  });

  it("lets flags win over the environment", () => {
    const s = readSettings(
      [
        "--url",
        "http://localhost:3032/",
        "--show-browser",
        "--save-dir",
        "/tmp/rec",
      ],
      {
        CAPTUREFLOW_URL: "https://other.example",
      },
    );
    expect(s.url).toBe("http://localhost:3032");
    expect(s.headless).toBe(false);
    expect(s.saveDir).toBe("/tmp/rec");
  });

  it("uses an OpenAI-compatible server once its URL is set", () => {
    const s = readSettings([], {
      CAPTUREFLOW_TTS_URL: "http://localhost:8880/v1",
      CAPTUREFLOW_TTS_VOICE: "af_bella",
    });
    expect(s.tts).toMatchObject({
      provider: "openai",
      url: "http://localhost:8880/v1",
      voice: "af_bella",
    });
  });

  it("ignores an unknown voice provider and a malformed viewport", () => {
    const s = readSettings([], {
      CAPTUREFLOW_TTS: "robot",
      CAPTUREFLOW_VIEWPORT: "huge",
    });
    expect(s.tts.provider).toBe("kokoro");
    expect(s.viewport).toEqual({ width: 1920, height: 1080 });
  });
});

describe("configDir", () => {
  it("follows each platform's convention", () => {
    expect(configDir({}, "darwin", "/Users/a")).toBe(
      "/Users/a/.config/captureflow",
    );
    expect(configDir({ XDG_CONFIG_HOME: "/x" }, "linux", "/home/a")).toBe(
      "/x/captureflow",
    );
    expect(
      configDir({ APPDATA: "C:\\AppData" }, "win32", "C:\\Users\\a"),
    ).toContain("CaptureFlow");
    expect(configDir({ CAPTUREFLOW_HOME: "/custom" }, "linux", "/home/a")).toBe(
      "/custom",
    );
  });
});

describe("hydrateCredentials", () => {
  const good = {
    token: "t".repeat(40),
    tokenId: "id",
    deviceId: "local-mcp-abc123",
  };

  it("keeps a well-formed sign-in", () => {
    expect(hydrateCredentials(good)).toEqual(good);
  });

  it("rejects anything the upload API would refuse", () => {
    expect(hydrateCredentials(null)).toBeNull();
    expect(hydrateCredentials({ ...good, token: "short" })).toBeNull();
    expect(hydrateCredentials({ ...good, deviceId: "x" })).toBeNull();
    expect(hydrateCredentials({ ...good, tokenId: 5 })).toBeNull();
  });
});
