import type { Metadata } from "next";
import { CanvasBoard } from "./CanvasBoard";

export const metadata: Metadata = {
  title: "Canvas",
  description: "A blank board to draw on while you record.",
  robots: { index: false, follow: false },
};

// Outside the dashboard shell on purpose: the board takes the whole viewport,
// and the extension opens it for anyone, signed in or not.
export default function CanvasPage() {
  return <CanvasBoard />;
}
