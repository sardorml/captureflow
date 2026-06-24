export type RecordingStatusKind =
  | "idle"
  | "preparing"
  | "recording"
  | "uploading"
  | "done"
  | "cancelled"
  | "error";

export type RecordingStatus = {
  kind: RecordingStatusKind;
  detail?: string;
};

export type RecordingResultPayload = {
  ok: boolean;
  // The viewer link, present on success.
  url?: string;
  bytes?: number;
  durationMs?: number;
  error?: string;
};

export type RecordingResult = RecordingResultPayload & { at: number };

const recordingStatusItem = storage.defineItem<RecordingStatus>(
  "session:recordingStatus",
  { fallback: { kind: "idle" } },
);

const recordingResultItem = storage.defineItem<RecordingResult | null>(
  "local:recordingResult",
  { fallback: null },
);

export const getRecordingStatus = (): Promise<RecordingStatus> =>
  recordingStatusItem.getValue();
export const setRecordingStatus = (status: RecordingStatus): Promise<void> =>
  recordingStatusItem.setValue(status);
export const watchRecordingStatus = (
  cb: (status: RecordingStatus) => void,
): (() => void) => recordingStatusItem.watch(cb);

export const getRecordingResult = (): Promise<RecordingResult | null> =>
  recordingResultItem.getValue();
export const saveRecordingResult = (
  result: RecordingResultPayload,
): Promise<void> => recordingResultItem.setValue({ ...result, at: Date.now() });
export const watchRecordingResult = (
  cb: (result: RecordingResult | null) => void,
): (() => void) => recordingResultItem.watch(cb);
