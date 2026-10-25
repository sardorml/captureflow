export type SplitMute = {
  setSystemMuted(muted: boolean): void;
  release(): void;
};

type MutedAccessor = {
  get(this: HTMLMediaElement): boolean;
  set(this: HTMLMediaElement, muted: boolean): void;
};

function nativeMuted(): MutedAccessor {
  const d = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    "muted",
  );
  if (!d?.get || !d.set) throw new Error("HTMLMediaElement.muted is missing");
  return { get: d.get, set: d.set } as MutedAccessor;
}

/*
 * The player's mute button and the webcam both read the screen element's
 * `muted`, so silencing the system track through that flag took the mic with
 * it. The element's own `muted` is shadowed instead: reads and writes carry
 * the viewer's intent, and the real flag is that intent OR "system sound
 * off", which nothing else can see.
 */
export function splitMute(
  el: HTMLMediaElement,
  native: MutedAccessor = nativeMuted(),
): SplitMute {
  let userMuted = native.get.call(el);
  let systemMuted = false;
  const apply = (): void => native.set.call(el, userMuted || systemMuted);
  Object.defineProperty(el, "muted", {
    configurable: true,
    enumerable: true,
    get: () => userMuted,
    set: (muted: boolean) => {
      userMuted = Boolean(muted);
      apply();
    },
  });
  return {
    setSystemMuted(muted) {
      systemMuted = muted;
      apply();
    },
    release() {
      delete (el as { muted?: boolean }).muted;
      native.set.call(el, userMuted);
    },
  };
}
