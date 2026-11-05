import type { Metadata } from "next";
import { getAppI18n } from "@/lib/i18n/app/server";
import { CanvasBoard } from "./CanvasBoard";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getAppI18n();
  return {
    title: m.canvas.meta.title,
    description: m.canvas.meta.description,
    robots: { index: false, follow: false },
  };
}

// Outside the dashboard shell on purpose: the board takes the whole viewport,
// and the extension opens it for anyone, signed in or not.
export default function CanvasPage() {
  return <CanvasBoard />;
}
