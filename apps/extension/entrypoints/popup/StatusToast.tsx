import { useEffect, useState } from "react";
import { setRecordingStatus, type RecordingStatus } from "@/lib/storage";

const SHOW_MS = 4000;

type Notice = { text: string; tone: "muted" | "danger" };

// Only the outcomes that have nowhere else to show. A recording that is
// starting, running or uploading already says so on the panel's main button.
function noticeFor(status: RecordingStatus): Notice | null {
  switch (status.kind) {
    case "cancelled":
      return { text: "Recording cancelled.", tone: "muted" };
    case "error":
      return { text: status.detail ?? "Something went wrong.", tone: "danger" };
    default:
      return null;
  }
}

/*
 * A pill over the card's bottom edge for a few seconds, instead of a line in
 * the stack that shifts everything under it. Once seen, the status goes back
 * to idle so the next open doesn't repeat it.
 */
export function StatusToast({ status }: { status: RecordingStatus }) {
  const notice = noticeFor(status);
  const [shown, setShown] = useState<Notice | null>(null);

  useEffect(() => {
    if (!notice) {
      setShown(null);
      return;
    }
    setShown(notice);
    const timer = setTimeout(() => {
      setShown(null);
      void setRecordingStatus({ kind: "idle" });
    }, SHOW_MS);
    return () => clearTimeout(timer);
    // Keyed on the words, so a status rewrite with the same message doesn't
    // restart the clock.
  }, [notice?.text, notice?.tone]);

  if (!shown) return null;
  return (
    <div
      role="status"
      className={`pointer-events-none absolute inset-x-4 bottom-3 rounded-xl border border-separator bg-overlay px-3 py-2 text-center text-xs ${
        shown.tone === "danger" ? "text-danger" : "text-muted"
      }`}
    >
      {shown.text}
    </div>
  );
}
