"use client";

import dynamic from "next/dynamic";
import { useAppMessages } from "@/components/app-i18n-provider";
import { ExtensionPrompt } from "./ExtensionPrompt";

function CanvasLoading() {
  const m = useAppMessages();
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-fg-muted">
      {m.canvas.loading}
    </div>
  );
}

// The board is canvas-only work, so its chunk loads on the client alone.
const CanvasBoardImpl = dynamic(
  () => import("./CanvasBoardImpl").then((m) => m.CanvasBoardImpl),
  {
    ssr: false,
    loading: () => <CanvasLoading />,
  },
);

export function CanvasBoard() {
  return (
    <>
      <CanvasBoardImpl />
      <ExtensionPrompt />
    </>
  );
}
