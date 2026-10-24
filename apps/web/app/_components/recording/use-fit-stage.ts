import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { fitStageSize } from "./layout";

type Box = { width: number; height: number };

// Sizes the stage to the largest box of the video's aspect that fits its
// parent, following the parent as it resizes. Off, the stage keeps its own
// (edge-to-edge) layout.
export function useFitStage(
  enabled: boolean,
  aspect: number,
): { ref: RefObject<HTMLDivElement | null>; style: CSSProperties | undefined } {
  const ref = useRef<HTMLDivElement | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  useLayoutEffect(() => {
    const parent = enabled ? ref.current?.parentElement : null;
    if (!parent) {
      setBox(null);
      return;
    }
    const measure = (): void =>
      setBox({ width: parent.clientWidth, height: parent.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [enabled]);

  const style =
    enabled && box && box.width > 0 && box.height > 0
      ? fitStageSize(box.width, box.height, aspect)
      : undefined;
  return { ref, style };
}
