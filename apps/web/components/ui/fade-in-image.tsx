"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

type FadeInImageProps = ComponentProps<"img">;

// An image that fades in once it has decoded instead of popping in. Show a
// placeholder behind it from the parent's background.
export function FadeInImage({ className, onLoad, ...props }: FadeInImageProps) {
  const ref = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  // A cached image can finish before the load handler is attached.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      decoding="async"
      loading="lazy"
      {...props}
      data-loaded={loaded || undefined}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn(
        "transition-opacity duration-300 ease-out",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
}
