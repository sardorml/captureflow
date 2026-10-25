"use client";

import { useEffect, type ComponentType, type ReactNode } from "react";
import {
  drainSplitStamps,
  reportSplitLoad,
  splitStamp,
} from "@/lib/dev/split-loads";

/*
 * Marks the content of a code-split section as arrived. Render it inside the
 * section, next to an element carrying data-split={name} that the overlay
 * can outline. The inline script runs as the streamed HTML is parsed; the
 * effect covers content that first renders on the client.
 */
export function SplitLoaded({ name }: { name: string }) {
  useEffect(() => {
    drainSplitStamps();
    reportSplitLoad(name);
  }, [name]);
  return <script dangerouslySetInnerHTML={{ __html: splitStamp(name) }} />;
}

// For dynamic() imports: wraps the loaded component so mounting it reports.
// The second signature keeps inference working for components whose props
// are optional.
export function withSplitLoaded<P extends object>(
  name: string,
  Component: ComponentType<P> | ((props?: P) => ReactNode),
): ComponentType<P> {
  const Inner = Component as ComponentType<P>;
  function Split(props: P) {
    return (
      <>
        <SplitLoaded name={name} />
        <Inner {...props} />
      </>
    );
  }
  Split.displayName = `SplitLoaded(${name})`;
  return Split;
}
