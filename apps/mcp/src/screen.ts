import { spawn } from "node:child_process";
import { SessionError, type FrameFeed } from "@captureflow/agent-recorder";
import { createJpegSplitter } from "./jpeg";
import { run } from "./runtime";

export type Display = {
  index: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  scale: number;
};

export type AppWindow = {
  id: string;
  app: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Screens = { displays: Display[]; windows: AppWindow[] };

export type ScreenTarget =
  | { kind: "display"; display: Display }
  | { kind: "window"; window: AppWindow; display: Display };

const FIRST_FRAME_MS = 12_000;
const BACKDROP = "0x0b0d12";

// Displays in CGGetActiveDisplayList order, which is the order ffmpeg numbers "Capture screen N" in.
const MAC_LIST_SCRIPT = `ObjC.import('AppKit');
ObjC.import('CoreGraphics');
function run() {
  const ids = Ref();
  const count = Ref();
  $.CGGetActiveDisplayList(16, ids, count);
  const meta = {};
  const screens = $.NSScreen.screens;
  for (let i = 0; i < screens.count; i++) {
    const s = screens.objectAtIndex(i);
    meta[ObjC.unwrap(s.deviceDescription.objectForKey('NSScreenNumber'))] = { scale: s.backingScaleFactor, name: ObjC.unwrap(s.localizedName) };
  }
  const displays = [];
  for (let i = 0; i < count[0]; i++) {
    const b = $.CGDisplayBounds(ids[i]);
    const m = meta[ids[i]] || {};
    displays.push({ index: i, name: m.name || 'Display ' + (i + 1), x: b.origin.x, y: b.origin.y, width: b.size.width, height: b.size.height, scale: m.scale || 1 });
  }
  const info = ObjC.deepUnwrap(ObjC.castRefToObject($.CGWindowListCopyWindowInfo(1 | 16, 0))) || [];
  const windows = info
    .filter((w) => w.kCGWindowLayer === 0 && w.kCGWindowBounds.Width > 120 && w.kCGWindowBounds.Height > 120)
    .map((w) => ({ id: String(w.kCGWindowNumber), app: w.kCGWindowOwnerName || '', title: w.kCGWindowName || '', x: w.kCGWindowBounds.X, y: w.kCGWindowBounds.Y, width: w.kCGWindowBounds.Width, height: w.kCGWindowBounds.Height }));
  return JSON.stringify({ displays, windows });
}`;

const WINDOWS_LIST_SCRIPT = `Add-Type -AssemblyName System.Windows.Forms
$i = 0
$d = @([System.Windows.Forms.Screen]::AllScreens | ForEach-Object { @{ index = $i++; name = $_.DeviceName; x = $_.Bounds.X; y = $_.Bounds.Y; width = $_.Bounds.Width; height = $_.Bounds.Height; scale = 1 } })
$w = @(Get-Process | Where-Object { $_.MainWindowTitle } | ForEach-Object { @{ id = [string]$_.Id; app = $_.ProcessName; title = $_.MainWindowTitle; x = 0; y = 0; width = 0; height = 0 } })
@{ displays = $d; windows = $w } | ConvertTo-Json -Depth 4 -Compress`;

// `xrandr --listmonitors` rows look like ` 0: +*eDP-1 1920/344x1080/194+0+0  eDP-1`.
export function parseXrandr(out: string): Display[] {
  const displays: Display[] = [];
  for (const line of out.split("\n")) {
    const m =
      /^\s*(\d+):\s+\S+\s+(\d+)\/\d+x(\d+)\/\d+\+(-?\d+)\+(-?\d+)\s+(\S+)/.exec(
        line,
      );
    if (!m) continue;
    displays.push({
      index: Number(m[1]),
      name: m[6]!,
      width: Number(m[2]),
      height: Number(m[3]),
      x: Number(m[4]),
      y: Number(m[5]),
      scale: 1,
    });
  }
  return displays;
}

// `wmctrl -lpG` rows: id, desktop, pid, x, y, w, h, host, title.
export function parseWmctrl(out: string): AppWindow[] {
  const windows: AppWindow[] = [];
  for (const line of out.split("\n")) {
    const m =
      /^(0x[0-9a-f]+)\s+(-?\d+)\s+\d+\s+(-?\d+)\s+(-?\d+)\s+(\d+)\s+(\d+)\s+\S+\s+(.*)$/i.exec(
        line,
      );
    if (!m || m[2] === "-1") continue;
    const title = m[7]!.trim();
    windows.push({
      id: m[1]!,
      app: title.split(" - ").at(-1) ?? title,
      title,
      x: Number(m[3]),
      y: Number(m[4]),
      width: Number(m[5]),
      height: Number(m[6]),
    });
  }
  return windows;
}

// ffmpeg's avfoundation device list, `[3] Capture screen 0`, as screen number → device number.
export function parseAvfScreens(stderr: string): Map<number, number> {
  const map = new Map<number, number>();
  for (const m of stderr.matchAll(/\[(\d+)\] Capture screen (\d+)/g)) {
    map.set(Number(m[2]), Number(m[1]));
  }
  return map;
}

function isWayland(env: NodeJS.ProcessEnv) {
  return (
    env.XDG_SESSION_TYPE === "wayland" ||
    (!!env.WAYLAND_DISPLAY && !env.DISPLAY)
  );
}

export async function listScreens(
  platform: NodeJS.Platform = process.platform,
): Promise<Screens> {
  if (platform === "darwin") {
    const { stdout } = await run("osascript", [
      "-l",
      "JavaScript",
      "-e",
      MAC_LIST_SCRIPT,
    ]);
    return JSON.parse(stdout) as Screens;
  }
  if (platform === "win32") {
    const { stdout } = await run("powershell", [
      "-NoProfile",
      "-NonInteractive",
      "-Command",
      WINDOWS_LIST_SCRIPT,
    ]);
    return JSON.parse(stdout) as Screens;
  }
  if (platform === "linux") {
    if (isWayland(process.env)) {
      throw new SessionError(
        'Screen recording needs an X11 session; this desktop runs Wayland. Log in with an X11 session ("Ubuntu on Xorg" on the login screen), or record a browser with start_recording.',
      );
    }
    const { stdout } = await run("xrandr", ["--listmonitors"]).catch(() => {
      throw new SessionError(
        "Screen recording on Linux needs xrandr (the x11-xserver-utils package).",
      );
    });
    const windows = await run("wmctrl", ["-lpG"])
      .then((r) => parseWmctrl(r.stdout))
      .catch(() => []);
    return { displays: parseXrandr(stdout), windows };
  }
  throw new SessionError(`Screen recording isn't supported on ${platform}.`);
}

// The app name first, then the window title; the biggest window wins a tie.
export function findWindow(
  windows: AppWindow[],
  query: string,
): AppWindow | null {
  const q = query.trim().toLowerCase();
  const area = (w: AppWindow) => w.width * w.height;
  const tiers = [
    windows.filter((w) => w.app.toLowerCase() === q),
    windows.filter((w) => w.title.toLowerCase().includes(q)),
    windows.filter((w) => w.app.toLowerCase().includes(q)),
  ];
  const hit = tiers.find((t) => t.length > 0);
  return hit ? hit.reduce((a, b) => (area(b) > area(a) ? b : a)) : null;
}

export function displayFor(displays: Display[], w: AppWindow): Display {
  const cx = w.x + w.width / 2;
  const cy = w.y + w.height / 2;
  return (
    displays.find(
      (d) =>
        cx >= d.x && cx < d.x + d.width && cy >= d.y && cy < d.y + d.height,
    ) ?? displays[0]!
  );
}

const even = (n: number) => Math.max(2, Math.floor(n / 2) * 2);

// The window's rectangle in the display's pixels, kept inside the display.
export function cropFor(w: AppWindow, d: Display): string {
  const x = Math.max(0, (w.x - d.x) * d.scale);
  const y = Math.max(0, (w.y - d.y) * d.scale);
  const width = Math.min(w.width * d.scale, d.width * d.scale - x);
  const height = Math.min(w.height * d.scale, d.height * d.scale - y);
  return `crop=${even(width)}:${even(height)}:${even(x)}:${even(y)}`;
}

export type GrabContext = { avfDevice?: number; x11Display?: string };

/*
 * The ffmpeg arguments that grab the target as MJPEG on stdout, fitted inside
 * width × height on a dark backdrop, so a window of any shape and the slides
 * between scenes share one frame size.
 */
export function grabArgs(
  platform: NodeJS.Platform,
  target: ScreenTarget,
  width: number,
  height: number,
  ctx: GrabContext = {},
): string[] {
  const d = target.display;
  let input: string[];
  let crop: string | null = null;
  if (platform === "darwin") {
    input = [
      "-f",
      "avfoundation",
      "-pixel_format",
      "nv12",
      "-capture_cursor",
      "1",
      "-capture_mouse_clicks",
      "1",
      "-framerate",
      "30",
      "-i",
      `${ctx.avfDevice ?? d.index}:none`,
    ];
    if (target.kind === "window") crop = cropFor(target.window, d);
  } else if (platform === "win32") {
    const base = ["-f", "gdigrab", "-framerate", "30", "-draw_mouse", "1"];
    input =
      target.kind === "window"
        ? [...base, "-i", `title=${target.window.title}`]
        : [
            ...base,
            "-offset_x",
            String(d.x),
            "-offset_y",
            String(d.y),
            "-video_size",
            `${d.width}x${d.height}`,
            "-i",
            "desktop",
          ];
  } else {
    const display = ctx.x11Display ?? ":0";
    const base = ["-f", "x11grab", "-framerate", "30", "-draw_mouse", "1"];
    input =
      target.kind === "window"
        ? [...base, "-window_id", target.window.id, "-i", display]
        : [
            ...base,
            "-video_size",
            `${d.width}x${d.height}`,
            "-i",
            `${display}+${d.x},${d.y}`,
          ];
  }
  const fit = `scale=${width}:${height}:force_original_aspect_ratio=decrease:flags=bicubic,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${BACKDROP}`;
  return [
    "-hide_banner",
    "-loglevel",
    "error",
    ...input,
    "-vf",
    crop ? `${crop},${fit}` : fit,
    "-r",
    "30",
    "-f",
    "image2pipe",
    "-c:v",
    "mjpeg",
    "-q:v",
    "4",
    "pipe:1",
  ];
}

export async function grabContext(
  ffmpeg: string,
  display: Display,
): Promise<GrabContext> {
  if (process.platform === "darwin") {
    // Listing devices always "fails" (there's no input), so the list is in the error's stderr.
    const { stderr } = await run(ffmpeg, [
      "-hide_banner",
      "-f",
      "avfoundation",
      "-list_devices",
      "true",
      "-i",
      "",
    ]).catch((err: { stderr?: string }) => ({ stderr: err.stderr ?? "" }));
    const device = parseAvfScreens(stderr).get(display.index);
    if (device === undefined) {
      throw new SessionError(
        "ffmpeg can't see that display. Is this ffmpeg built with avfoundation?",
      );
    }
    return { avfDevice: device };
  }
  if (process.platform === "linux")
    return { x11Display: process.env.DISPLAY ?? ":0" };
  return {};
}

const PERMISSION_HINT: Partial<Record<NodeJS.Platform, string>> = {
  darwin:
    "macOS hasn't let the app running your agent record the screen. Open System Settings → Privacy & Security → Screen & System Audio Recording, turn on that app (your terminal or editor), restart it, then try again.",
  linux: "Check that DISPLAY points at your X11 session.",
};

export function screenFeed(ffmpeg: string, args: string[]): FrameFeed {
  return (onFrame) =>
    new Promise((resolve, reject) => {
      const child = spawn(ffmpeg, args, { stdio: ["ignore", "pipe", "pipe"] });
      let stderr = "";
      let started = false;
      const closed = new Promise<void>((r) => child.on("close", () => r()));
      const stop = async () => {
        child.kill();
        const forced = setTimeout(() => child.kill("SIGKILL"), 3000);
        await closed;
        clearTimeout(forced);
      };
      const timer = setTimeout(() => {
        void stop();
        reject(
          new SessionError(
            `No picture from the screen. ${PERMISSION_HINT[process.platform] ?? ""} ${stderr.trim().split("\n").at(-1) ?? ""}`.trim(),
          ),
        );
      }, FIRST_FRAME_MS);
      // macOS prints objc class warnings on every avfoundation start; they aren't the error.
      child.stderr.on("data", (c: Buffer) => {
        const lines = String(c)
          .split("\n")
          .filter((l) => !l.startsWith("objc["));
        stderr = (stderr + lines.join("\n")).slice(-2000);
      });
      child.stdout.on(
        "data",
        createJpegSplitter((jpeg) => {
          onFrame(jpeg);
          if (!started) {
            started = true;
            clearTimeout(timer);
            resolve(stop);
          }
        }),
      );
      child.on("error", (err) => {
        clearTimeout(timer);
        reject(new SessionError(`ffmpeg didn't start: ${err.message}`));
      });
      child.on("close", (code) => {
        if (started) return;
        clearTimeout(timer);
        reject(
          new SessionError(
            `Screen capture failed (ffmpeg ${code}): ${stderr.trim() || PERMISSION_HINT[process.platform] || ""}`,
          ),
        );
      });
    });
}
