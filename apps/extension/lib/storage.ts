export type SpikeStatusKind =
  | "idle"
  | "preparing"
  | "recording"
  | "done"
  | "cancelled"
  | "error";

export type SpikeStatus = {
  kind: SpikeStatusKind;
  detail?: string;
};

export type SpikeResultPayload = {
  ok: boolean;
  mimeType: string;
  bytes: number;
  durationMs: number;
  error?: string;
};

export type SpikeResult = SpikeResultPayload & { at: number };

const spikeStatusItem = storage.defineItem<SpikeStatus>("session:spikeStatus", {
  fallback: { kind: "idle" },
});

const spikeResultItem = storage.defineItem<SpikeResult | null>(
  "local:spikeResult",
  { fallback: null },
);

export const getSpikeStatus = (): Promise<SpikeStatus> =>
  spikeStatusItem.getValue();
export const setSpikeStatus = (status: SpikeStatus): Promise<void> =>
  spikeStatusItem.setValue(status);
export const watchSpikeStatus = (
  cb: (status: SpikeStatus) => void,
): (() => void) => spikeStatusItem.watch(cb);

export const getSpikeResult = (): Promise<SpikeResult | null> =>
  spikeResultItem.getValue();
export const saveSpikeResult = (result: SpikeResultPayload): Promise<void> =>
  spikeResultItem.setValue({ ...result, at: Date.now() });
export const watchSpikeResult = (
  cb: (result: SpikeResult | null) => void,
): (() => void) => spikeResultItem.watch(cb);
