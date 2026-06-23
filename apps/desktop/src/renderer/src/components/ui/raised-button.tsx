import { forwardRef, useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type RaisedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

// Raised keycap button. Tracks press state via pointer events instead of :active
// because macOS / trackpad sometimes skips the :active pseudo on fast clicks.
export const RaisedButton = forwardRef<HTMLButtonElement, RaisedButtonProps>(
  function RaisedButton(
    {
      className,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      ...props
    },
    ref,
  ) {
    const [pressed, setPressed] = useState(false);
    const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const down = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        setPressed(true);
        onPointerDown?.(e);
      },
      [onPointerDown],
    );
    const up = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        releaseTimer.current = setTimeout(() => setPressed(false), 120);
        onPointerUp?.(e);
      },
      [onPointerUp],
    );
    const release = useCallback(
      (e: React.PointerEvent<HTMLButtonElement>) => {
        if (releaseTimer.current) clearTimeout(releaseTimer.current);
        releaseTimer.current = setTimeout(() => setPressed(false), 120);
        onPointerLeave?.(e);
        onPointerCancel?.(e);
      },
      [onPointerLeave, onPointerCancel],
    );

    return (
      <button
        ref={ref}
        data-pressed={pressed ? "true" : undefined}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={release}
        onPointerCancel={release}
        className={cn(
          "select-none transition-[transform,box-shadow] duration-100 ease-out disabled:cursor-not-allowed",
          className,
        )}
        {...props}
      />
    );
  },
);
