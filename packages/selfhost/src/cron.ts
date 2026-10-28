export type CronJob = { cron: string; run: () => Promise<void> };

// Only the minute and hour fields are honored ("0 * * * *", "0 4 * * *"),
// which covers every schedule in the wrangler configs. Times are UTC, as on Cloudflare.
export function cronMatches(cron: string, at: Date): boolean {
  const [minute, hour] = cron.trim().split(/\s+/);
  const field = (spec: string | undefined, value: number) =>
    spec === "*" || Number(spec) === value;
  return field(minute, at.getUTCMinutes()) && field(hour, at.getUTCHours());
}

export function startCron(jobs: CronJob[]): () => void {
  let timer: NodeJS.Timeout;
  const fire = () => {
    const now = new Date();
    for (const job of jobs) {
      if (!cronMatches(job.cron, now)) continue;
      job.run().catch((err) => console.error(`[cron] ${job.cron} failed`, err));
    }
    schedule();
  };
  const schedule = () => {
    const now = Date.now();
    timer = setTimeout(fire, 60_000 - (now % 60_000) + 50);
  };
  schedule();
  return () => clearTimeout(timer);
}
