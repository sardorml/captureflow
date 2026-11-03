"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

const SCENE = { width: 600, height: 424 };
// The scene sits vertically centred on the frame's background.
const FRAME = { width: 600, height: 400 };
const RADIUS = 12;

export type SceneState = { step: number; playing: boolean };

/*
 * Enlarges a scene authored at the frame's width: `bounds` are the x extents
 * its content actually spans, so the scaled content lands centred in the
 * frame instead of being clipped on the far side.
 */
export type SceneZoom = { scale: number; bounds: readonly [number, number] };

function zoomStyle(zoom: SceneZoom | undefined) {
  if (!zoom) return {};
  const centre = (zoom.bounds[0] + zoom.bounds[1]) / 2;
  return {
    transformOrigin: `${centre}px 50%`,
    transform: `translateX(${FRAME.width / 2 - centre}px) scale(${zoom.scale})`,
  };
}

/*
 * A pixel-authored scene scaled to fit its column, with the background filling
 * whatever space is left. `steps` are the ms offsets at
 * which each step starts within one `loopMs` cycle; see `useSceneLoop` for when
 * it runs.
 */
export function SceneFrame({
  steps,
  loopMs,
  background,
  sceneHeight = SCENE.height,
  zoom,
  children,
}: {
  steps: readonly number[];
  loopMs: number;
  background: string;
  sceneHeight?: number;
  zoom?: SceneZoom;
  children: (state: SceneState) => ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { step, playing } = useSceneLoop(ref, steps, loopMs);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const resize = () =>
      setScale(
        Math.min(el.clientWidth / FRAME.width, el.clientHeight / FRAME.height),
      );
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative size-full overflow-hidden"
      style={{
        aspectRatio: `${FRAME.width} / ${FRAME.height}`,
        background,
        borderRadius: RADIUS,
      }}
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          ...FRAME,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div
          className="absolute left-0"
          style={{
            width: SCENE.width,
            height: sceneHeight,
            top: (FRAME.height - sceneHeight) / 2,
            ...zoomStyle(zoom),
          }}
        >
          {children({ step, playing })}
        </div>
      </div>
    </div>
  );
}

// Plays from the first step while the card holding `ref` is hovered and on
// screen, and otherwise holds the last. Touch screens can't hover, so they play
// whenever it's on screen.
export function useSceneLoop(
  ref: RefObject<HTMLElement | null>,
  steps: readonly number[],
  loopMs: number,
): SceneState {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [step, setStep] = useState(0);
  const playing = visible && hovered && !reducedMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    const card = ref.current?.closest(".group\\/card");
    if (!card || !window.matchMedia("(hover: hover)").matches) {
      setHovered(true);
      return;
    }
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    card.addEventListener("pointerenter", enter);
    card.addEventListener("pointerleave", leave);
    card.addEventListener("focusin", enter);
    card.addEventListener("focusout", leave);
    return () => {
      card.removeEventListener("pointerenter", enter);
      card.removeEventListener("pointerleave", leave);
      card.removeEventListener("focusin", enter);
      card.removeEventListener("focusout", leave);
    };
  }, [ref]);

  useEffect(() => {
    if (!playing) {
      setStep(steps.length - 1);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      steps.forEach((at, i) => timers.push(setTimeout(() => setStep(i), at)));
      timers.push(setTimeout(run, loopMs));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [steps, loopMs, playing]);

  // `step` is a dependency because a scene can mount its video partway through.
  useEffect(() => {
    ref.current?.querySelectorAll("video").forEach((video) => {
      if (playing) void video.play().catch(() => {});
      else video.pause();
    });
  }, [ref, playing, step]);

  return { step, playing };
}

// Runs `keyframes` across one loop while the scene plays, restarting with it.
export function useLoopAnimation(
  ref: RefObject<HTMLElement | null>,
  keyframes: Keyframe[],
  loopMs: number,
  playing: boolean,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;
    const animation = el.animate(keyframes, {
      duration: loopMs,
      iterations: Infinity,
    });
    return () => animation.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, loopMs, playing]);
}
