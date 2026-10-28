import { DatabaseSync } from "node:sqlite";

export type QueueOutcome = "ack" | { retryDelaySeconds: number };

export type QueueConsumer<T> = (
  body: T,
  attempts: number,
) => Promise<QueueOutcome>;

export type LocalQueue<T> = {
  producer: Queue<T>;
  start: () => void;
  stop: () => Promise<void>;
};

const POLL_MS = 1000;
// A job a crashed process was holding becomes due again after this long.
const LEASE_MS = 15 * 60 * 1000;

/*
 * A Cloudflare Queue stand-in that keeps messages in its own SQLite file,
 * so pending transcription work survives a container restart and never
 * touches the app schema. Delivery is at-least-once, like the real thing.
 */
export function createLocalQueue<T>(
  path: string,
  consume: QueueConsumer<T>,
  concurrency = 2,
): LocalQueue<T> {
  const sqlite = new DatabaseSync(path);
  sqlite.exec(`PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      attempts INTEGER NOT NULL DEFAULT 0,
      run_at INTEGER NOT NULL
    )`);
  const insert = sqlite.prepare(
    "INSERT INTO jobs (body, run_at) VALUES (?, ?)",
  );
  const claim = sqlite.prepare(
    `UPDATE jobs SET attempts = attempts + 1, run_at = ?
      WHERE id = (SELECT id FROM jobs WHERE run_at <= ? ORDER BY run_at, id LIMIT 1)
      RETURNING id, body, attempts`,
  );
  const remove = sqlite.prepare("DELETE FROM jobs WHERE id = ?");
  const reschedule = sqlite.prepare("UPDATE jobs SET run_at = ? WHERE id = ?");

  let timer: NodeJS.Timeout | undefined;
  const running = new Set<Promise<void>>();

  function enqueue(body: T, delaySeconds = 0): void {
    insert.run(JSON.stringify(body), Date.now() + delaySeconds * 1000);
  }

  async function handle(id: number, body: T, attempts: number): Promise<void> {
    try {
      const outcome = await consume(body, attempts);
      if (outcome === "ack") remove.run(id);
      else reschedule.run(Date.now() + outcome.retryDelaySeconds * 1000, id);
    } catch (err) {
      console.error("[queue] consumer threw; retrying in 60s", err);
      reschedule.run(Date.now() + 60_000, id);
    }
  }

  function tick(): void {
    while (running.size < concurrency) {
      const now = Date.now();
      const job = claim.get(now + LEASE_MS, now);
      if (!job) return;
      const task = handle(
        Number(job.id),
        JSON.parse(String(job.body)) as T,
        Number(job.attempts),
      ).finally(() => running.delete(task));
      running.add(task);
    }
  }

  const producer = {
    send: async (body: T, options?: QueueSendOptions) => {
      enqueue(body, options?.delaySeconds);
    },
    sendBatch: async (
      messages: Iterable<MessageSendRequest<T>>,
      options?: QueueSendBatchOptions,
    ) => {
      for (const message of messages) {
        enqueue(message.body, message.delaySeconds ?? options?.delaySeconds);
      }
    },
  } as unknown as Queue<T>;

  return {
    producer,
    start() {
      timer ??= setInterval(tick, POLL_MS);
    },
    async stop() {
      clearInterval(timer);
      timer = undefined;
      await Promise.allSettled([...running]);
      sqlite.close();
    },
  };
}
