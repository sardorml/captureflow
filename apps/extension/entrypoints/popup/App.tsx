import { useEffect, useState } from "react";
import { sendMessage } from "@/lib/messaging";
import {
  getSpikeResult,
  getSpikeStatus,
  watchSpikeResult,
  watchSpikeStatus,
  type SpikeResult,
  type SpikeStatus,
} from "@/lib/storage";
import { RecorderPanel } from "./RecorderPanel";

export function App() {
  const [status, setStatus] = useState<SpikeStatus>({ kind: "idle" });
  const [result, setResult] = useState<SpikeResult | null>(null);

  useEffect(() => {
    void getSpikeStatus().then(setStatus);
    void getSpikeResult().then(setResult);
    const unwatchStatus = watchSpikeStatus(setStatus);
    const unwatchResult = watchSpikeResult(setResult);
    return () => {
      unwatchStatus();
      unwatchResult();
    };
  }, []);

  // The popup closes as soon as the OS picker takes focus, so the result is
  // read back from storage when the popup is reopened.
  const onStart = () => sendMessage("startSpike", undefined);

  return <RecorderPanel status={status} result={result} onStart={onStart} />;
}
