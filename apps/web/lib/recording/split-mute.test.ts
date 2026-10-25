import { describe, expect, it } from "vitest";
import { splitMute } from "./split-mute";

// A stand-in element with the accessor on its prototype, as in a browser;
// `real` is what the browser would play by.
function fakeElement(): { el: HTMLMediaElement; real: () => boolean } {
  let real = false;
  const proto = {};
  const native = {
    get(this: HTMLMediaElement) {
      return real;
    },
    set(this: HTMLMediaElement, muted: boolean) {
      real = muted;
    },
  };
  Object.defineProperty(proto, "muted", { ...native, configurable: true });
  return { el: Object.create(proto) as HTMLMediaElement, real: () => real };
}

function split(el: HTMLMediaElement) {
  const native = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "muted",
  )!;
  return splitMute(el, { get: native.get!, set: native.set! });
}

describe("splitMute", () => {
  it("silences the element for system-off without the viewer seeing a mute", () => {
    const { el, real } = fakeElement();
    const mute = split(el);
    mute.setSystemMuted(true);
    expect(real()).toBe(true);
    expect(el.muted).toBe(false);
  });

  it("keeps the viewer's mute on top of system-off", () => {
    const { el, real } = fakeElement();
    const mute = split(el);
    mute.setSystemMuted(true);
    el.muted = true;
    expect(el.muted).toBe(true);
    mute.setSystemMuted(false);
    expect(real()).toBe(true);
    el.muted = false;
    expect(real()).toBe(false);
  });

  it("hands the element back with the viewer's state", () => {
    const { el, real } = fakeElement();
    const mute = split(el);
    mute.setSystemMuted(true);
    mute.release();
    expect(real()).toBe(false);
    el.muted = true;
    expect(real()).toBe(true);
  });
});
