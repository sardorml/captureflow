import type {
  RecordingComment,
  RecordingReaction,
  RecordingRow,
  TranscriptRow,
  TranscriptSource,
} from "./types";

export type UpsertTranscriptInput = {
  slug: string;
  source: TranscriptSource;
  language: string | null;
  autoJson: string;
};

export type RecordingDb = {
  insertRecording(row: RecordingRow): Promise<void>;
  getRecording(slug: string): Promise<RecordingRow | null>;
  updateRecording(
    slug: string,
    patch: Partial<RecordingRow>,
  ): Promise<RecordingRow | null>;
  deleteRecording(slug: string): Promise<boolean>;
  listRecordingsForDevice(deviceId: string): Promise<RecordingRow[]>;
  listRecordingsForUser(userId: string): Promise<RecordingRow[]>;
  totalStorageForDevice(deviceId: string): Promise<number>;
  activeRecordingCountForDevice(deviceId: string): Promise<number>;
  bumpLastViewed(slug: string): Promise<void>;
  addReaction(input: {
    slug: string;
    emoji: string;
    timestampMs: number;
    userId: string | null;
    userName: string | null;
  }): Promise<RecordingReaction>;
  listReactions(slug: string): Promise<RecordingReaction[]>;
  countReactions(slug: string): Promise<number>;
  addComment(input: {
    slug: string;
    userId: string;
    userName: string;
    body: string;
    timestampMs: number | null;
  }): Promise<RecordingComment>;
  listComments(slug: string): Promise<RecordingComment[]>;
  countComments(slug: string): Promise<number>;
  getComment(id: number): Promise<RecordingComment | null>;
  deleteComment(id: number): Promise<boolean>;
  // Replaces the auto transcript and clears any owner edits.
  upsertTranscript(input: UpsertTranscriptInput): Promise<void>;
  getTranscript(slug: string): Promise<TranscriptRow | null>;
};
