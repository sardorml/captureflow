"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { setDevPref, useDevPref } from "@/lib/dev/prefs";
import { markNavigation } from "@/lib/dev/split-loads";

const DevToolsModal = dynamic(
  () => import("./dev-tools-modal").then((m) => m.DevToolsModal),
  { ssr: false },
);
const CodeSplitOverlay = dynamic(
  () => import("./code-split-overlay").then((m) => m.CodeSplitOverlay),
  { ssr: false },
);

// A navigation started more than this long after the last click is not the
// click's doing, so section times stay relative to the page load.
const CLICK_TO_NAVIGATION_MS = 15_000;

// ⌘⇧E (Ctrl+Shift+E) opens the developer panel on any page. Nothing here
// loads until the shortcut is used or the code-split view was left on.
export function DevTools() {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const codeSplitView = useDevPref("code-split-view");
  const pathname = usePathname();
  const lastClick = useRef(-Infinity);
  const firstPath = useRef(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.code === "KeyE") {
        e.preventDefault();
        setOpened(true);
        setOpen(true);
      }
    };
    const onPointerDown = () => {
      lastClick.current = performance.now();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown, true);
    };
  }, []);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    if (performance.now() - lastClick.current < CLICK_TO_NAVIGATION_MS) {
      markNavigation(lastClick.current);
    }
  }, [pathname]);

  return (
    <>
      {codeSplitView ? <CodeSplitOverlay /> : null}
      {opened ? (
        <DevToolsModal
          isOpen={open}
          onOpenChange={setOpen}
          codeSplitView={codeSplitView}
          onCodeSplitViewChange={(on) => setDevPref("code-split-view", on)}
        />
      ) : null}
    </>
  );
}
