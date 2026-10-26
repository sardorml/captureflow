"use client";

import dynamic from "next/dynamic";

// The board is canvas-only work, so its chunk loads on the client alone.
const CanvasBoardImpl = dynamic(
  () => import("./CanvasBoardImpl").then((m) => m.CanvasBoardImpl),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-fg-muted">
        Loading canvas…
      </div>
    ),
  },
);

export function CanvasBoard() {
  return <CanvasBoardImpl />;
}
