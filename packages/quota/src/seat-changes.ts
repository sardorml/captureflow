/// <reference types="@cloudflare/workers-types" />

export type SeatChange = {
  from_quantity: number;
  to_quantity: number;
  changed_at: number;
};

export async function recordSeatChange(
  db: D1Database,
  args: {
    subscriptionId: string;
    from: number;
    to: number;
    at: number;
  },
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO seat_change
         (ls_subscription_id, from_quantity, to_quantity, changed_at)
       VALUES (?1, ?2, ?3, ?4)`,
    )
    .bind(args.subscriptionId, args.from, args.to, args.at)
    .run();
}

export async function listSeatChangesSince(
  db: D1Database,
  subscriptionId: string,
  since: number,
): Promise<SeatChange[]> {
  const { results } = await db
    .prepare(
      `SELECT from_quantity, to_quantity, changed_at FROM seat_change
        WHERE ls_subscription_id = ?1 AND changed_at >= ?2
        ORDER BY changed_at ASC`,
    )
    .bind(subscriptionId, since)
    .all<SeatChange>();
  return results ?? [];
}
