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
const RADIUS = 40;

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
 * A pixel-authored scene scaled to its column. `steps` are the ms offsets at
 * which each step starts within one `loopMs` cycle; the loop only runs while
 * the scene is on screen, and reduced motion holds the last step.
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
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [step, setStep] = useState(0);
  const playing = visible && !reducedMotion;

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
    const resize = () => setScale(el.clientWidth / FRAME.width);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    io.observe(el);
    return () => {
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setStep(steps.length - 1);
      return;
    }
    if (!visible) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      steps.forEach((at, i) => timers.push(setTimeout(() => setStep(i), at)));
      timers.push(setTimeout(run, loopMs));
    };
    run();
    return () => timers.forEach(clearTimeout);
  }, [steps, loopMs, visible, reducedMotion]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: `${FRAME.width} / ${FRAME.height}`,
        borderRadius: RADIUS * scale,
      }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{ ...FRAME, background, transform: `scale(${scale})` }}
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
