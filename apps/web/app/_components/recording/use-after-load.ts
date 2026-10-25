"use client";

import { useEffect, useState } from "react";
import { whenIdle } from "@/lib/when-idle";

// True once the page has loaded and the browser is idle, for work that must
// not compete with the poster and the scripts for bandwidth.
export function useAfterLoad(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let cancelIdle = () => {};
    const onLoad = () => {
      cancelIdle = whenIdle(() => setReady(true));
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      cancelIdle();
    };
  }, []);
  return ready;
}
