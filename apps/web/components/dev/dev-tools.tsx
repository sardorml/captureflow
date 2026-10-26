"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { markNavigation } from "@/lib/dev/split-loads";

const DevToolsModal = dynamic(
  () => import("./dev-tools-modal").then((m) => m.DevToolsModal),
  { ssr: false },
);
const CodeSplitOverlay = dynamic(
  () => import("./code-split-overlay").then((m) => m.CodeSplitOverlay),
  { ssr: false },
);

const CODE_SPLIT_VIEW_KEY = "captureflow.dev.code-split-view";
const prefListeners = new Set<() => void>();

function readCodeSplitView() {
  try {
    return localStorage.getItem(CODE_SPLIT_VIEW_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCodeSplitView(on: boolean) {
  try {
    localStorage.setItem(CODE_SPLIT_VIEW_KEY, on ? "1" : "0");
  } catch {
    // Private windows can refuse storage; the view then lasts the page.
  }
  for (const listener of prefListeners) listener();
}

function subscribeCodeSplitView(listener: () => void) {
  prefListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    prefListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// A navigation started more than this long after the last click is not the
// click's doing, so section times stay relative to the page load.
const CLICK_TO_NAVIGATION_MS = 15_000;

// ⌘⇧E (Ctrl+Shift+E) opens the developer panel on any page. Nothing here
// loads until the shortcut is used or the code-split view was left on.
export function DevTools() {
  const [open, setOpen] = useState(false);
  const [opened, setOpened] = useState(false);
  const codeSplitView = useSyncExternalStore(
    subscribeCodeSplitView,
    readCodeSplitView,
    () => false,
  );
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
          onCodeSplitViewChange={writeCodeSplitView}
        />
      ) : null}
    </>
  );
}
