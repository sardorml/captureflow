import { describe, expect, it } from "vitest";
import {
  cropFor,
  displayFor,
  findWindow,
  grabArgs,
  parseAvfScreens,
  parseWmctrl,
  parseXrandr,
  type AppWindow,
  type Display,
} from "./screen";

const retina: Display = {
  index: 0,
  name: "Built-in",
  x: 0,
  y: 0,
  width: 1512,
  height: 982,
  scale: 2,
};
const side: Display = {
  index: 1,
  name: "Side",
  x: 1512,
  y: 0,
  width: 1920,
  height: 1080,
  scale: 1,
};
const win = (
  app: string,
  title: string,
  x = 0,
  y = 0,
  width = 800,
  height = 600,
): AppWindow => ({ id: app, app, title, x, y, width, height });

describe("parsers", () => {
  it("reads xrandr monitors", () => {
    const out =
      "Monitors: 2\n 0: +*eDP-1 1920/344x1080/194+0+0  eDP-1\n 1: +HDMI-1 2560/597x1440/336+1920+0  HDMI-1\n";
    expect(parseXrandr(out)).toEqual([
      {
        index: 0,
        name: "eDP-1",
        width: 1920,
        height: 1080,
        x: 0,
        y: 0,
        scale: 1,
      },
      {
        index: 1,
        name: "HDMI-1",
        width: 2560,
        height: 1440,
        x: 1920,
        y: 0,
        scale: 1,
      },
    ]);
  });

  it("reads wmctrl windows and skips sticky panels", () => {
    const out =
      "0x03a00007  0 4242   10   20   1200 800  host my-app - Visual Studio Code\n0x01200003 -1 99   0 0 1920 30  host panel\n";
    expect(parseWmctrl(out)).toEqual([
      {
        id: "0x03a00007",
        app: "Visual Studio Code",
        title: "my-app - Visual Studio Code",
        x: 10,
        y: 20,
        width: 1200,
        height: 800,
      },
    ]);
  });

  it("maps avfoundation screens to device numbers", () => {
    const stderr =
      "[AVFoundation indev @ 0x1] [0] FaceTime HD Camera\n[AVFoundation indev @ 0x1] [1] Capture screen 0\n[AVFoundation indev @ 0x1] [2] Capture screen 1\n";
    expect([...parseAvfScreens(stderr)]).toEqual([
      [0, 1],
      [1, 2],
    ]);
  });
});

describe("findWindow", () => {
  const windows = [
    win("Terminal", "zsh", 0, 0, 400, 300),
    win("Terminal", "npm test", 0, 0, 900, 700),
    win("Google Chrome", "Pull requests"),
  ];

  it("prefers the app's name, and its biggest window", () => {
    expect(findWindow(windows, "terminal")?.title).toBe("npm test");
  });

  it("falls back to the window title, then part of the app's name", () => {
    expect(findWindow(windows, "pull requests")?.app).toBe("Google Chrome");
    expect(findWindow(windows, "chrome")?.app).toBe("Google Chrome");
    expect(findWindow(windows, "figma")).toBeNull();
  });
});

describe("window geometry", () => {
  it("finds the display under the window's middle", () => {
    expect(displayFor([retina, side], win("A", "", 1700, 100)).name).toBe(
      "Side",
    );
    expect(displayFor([retina, side], win("A", "", 100, 100)).name).toBe(
      "Built-in",
    );
  });

  it("crops in the display's pixels, kept inside it", () => {
    expect(cropFor(win("A", "", 100, 50, 800, 600), retina)).toBe(
      "crop=1600:1200:200:100",
    );
    expect(cropFor(win("A", "", 1000, 500, 800, 600), retina)).toBe(
      "crop=1024:964:2000:1000",
    );
  });
});

describe("grabArgs", () => {
  it("records a mac display through avfoundation, fitted to the frame", () => {
    const args = grabArgs(
      "darwin",
      { kind: "display", display: retina },
      1920,
      1080,
      { avfDevice: 3 },
    );
    expect(args).toContain("avfoundation");
    expect(args[args.indexOf("-i") + 1]).toBe("3:none");
    expect(args[args.indexOf("-vf") + 1]).toMatch(
      /^scale=1920:1080:force_original_aspect_ratio=decrease/,
    );
    expect(args.at(-1)).toBe("pipe:1");
  });

  it("crops a mac window out of its display", () => {
    const args = grabArgs(
      "darwin",
      { kind: "window", window: win("A", "", 100, 50), display: retina },
      1920,
      1080,
      { avfDevice: 1 },
    );
    expect(args[args.indexOf("-vf") + 1]).toMatch(
      /^crop=1600:1200:200:100,scale=/,
    );
  });

  it("grabs a Windows window by title and a display by its rectangle", () => {
    const byTitle = grabArgs(
      "win32",
      { kind: "window", window: win("code", "app.ts - Code"), display: side },
      1920,
      1080,
    );
    expect(byTitle[byTitle.indexOf("-i") + 1]).toBe("title=app.ts - Code");
    const desk = grabArgs(
      "win32",
      { kind: "display", display: side },
      1920,
      1080,
    );
    expect(desk.join(" ")).toContain(
      "-offset_x 1512 -offset_y 0 -video_size 1920x1080 -i desktop",
    );
  });

  it("grabs an X11 window by id and a monitor by offset", () => {
    const w = grabArgs(
      "linux",
      {
        kind: "window",
        window: { ...win("A", "a"), id: "0x3a" },
        display: side,
      },
      1920,
      1080,
      { x11Display: ":1" },
    );
    expect(w.join(" ")).toContain("-window_id 0x3a -i :1");
    const d = grabArgs(
      "linux",
      { kind: "display", display: side },
      1920,
      1080,
      { x11Display: ":1" },
    );
    expect(d.join(" ")).toContain("-video_size 1920x1080 -i :1+1512,0");
  });
});
