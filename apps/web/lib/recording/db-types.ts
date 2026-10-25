import type {
  RecordingComment,
  RecordingReaction,
  RecordingRow,
  RecordingViewerEntry,
  TranscriptPartRow,
  TranscriptRow,
} from "./types";

export type CreateTranscriptJobInput = {
  slug: string;
  language: string | null;
  parts: {
    partNumber: number;
    storageKey: string;
    startMs: number;
    endMs: number;
  }[];
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
  recordView(
    slug: string,
    viewerKey: string,
    userId: string | null,
  ): Promise<void>;
  listViewers(slug: string): Promise<RecordingViewerEntry[]>;
  addReaction(input: {
    slug: string;
    emoji: string;
    timestampMs: number;
    userId: string | null;
    userName: string | null;
  }): Promise<RecordingReaction>;
  listReactions(slug: string): Promise<RecordingReaction[]>;
  countReactions(slug: string): Promise<number>;
  getReaction(id: number): Promise<RecordingReaction | null>;
  deleteReaction(id: number): Promise<boolean>;
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
  // Starts (or restarts) the transcript: status pending, previous result,
  // edits and parts discarded.
  createTranscriptJob(input: CreateTranscriptJobInput): Promise<void>;
  getTranscript(slug: string): Promise<TranscriptRow | null>;
  getTranscriptPart(
    slug: string,
    partNumber: number,
  ): Promise<TranscriptPartRow | null>;
  listTranscriptParts(slug: string): Promise<TranscriptPartRow[]>;
  setTranscriptPartLines(
    slug: string,
    partNumber: number,
    segmentsJson: string,
  ): Promise<void>;
  // Both only move a pending job; a finished or failed one stays as it is.
  finishTranscript(slug: string, autoJson: string): Promise<void>;
  failTranscript(slug: string, error: string): Promise<void>;
};
